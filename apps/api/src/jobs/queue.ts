import { Queue } from 'bullmq';
import { createAdminClient } from '../db/supabaseAdmin';
import { buildPhase2Context } from '../services/phase2/promptBuilder';
import { structureRecipeWithClaude } from '../services/phase2/claudeClient';
import { normalizeRecipe } from '../services/phase2/normalizer';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';

export interface Phase2JobData {
  recipeId: string;
  userId: string;
}

function isQueueEnabled(): boolean {
  return Boolean(redisUrl);
}

export const phase2Queue: Queue<Phase2JobData> | null = isQueueEnabled()
  ? new Queue<Phase2JobData>('phase2', {
      connection: { host: redisUrl },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
  : null;

/** Phase 2 をインプロセスで直接実行（Redis なし・ローカル開発用） */
async function runPhase2Directly(data: Phase2JobData): Promise<void> {
  const { recipeId, userId } = data;
  const supabase = createAdminClient();

  const { data: recipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !recipe) return;

  const context = buildPhase2Context({
    title: recipe.title as string,
    rawDescription: (recipe.raw_description as string) ?? (recipe.title as string),
    phase1Ingredients: (recipe.ingredients as Array<{ name: string }>) ?? [],
  });

  const structured = await structureRecipeWithClaude(recipe.title as string, context);
  const normalized = normalizeRecipe(structured);

  await supabase
    .from('recipes')
    .update({
      phase: 'phase2',
      extraction_status: 'done',
      ingredients: normalized.ingredients,
      steps: normalized.steps,
      tags: normalized.tags,
      cook_time_minutes: normalized.cookTimeMinutes ?? recipe.cook_time_minutes,
    })
    .eq('id', recipeId);

  console.log(`[Phase2] done: ${recipeId} — steps: ${normalized.steps.length}`);
}

export async function enqueuePhase2(data: Phase2JobData): Promise<void> {
  if (phase2Queue) {
    await phase2Queue.add('process', data, { jobId: `phase2:${data.recipeId}` });
    return;
  }

  // Redis 未設定時はインプロセスで非同期実行（fire-and-forget）
  runPhase2Directly(data).catch((err) => {
    console.error('[Phase2] direct run failed:', err);
  });
}
