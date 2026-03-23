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

  console.log(`[Phase2] start: ${recipeId}`);

  const { data: recipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !recipe) {
    console.error(`[Phase2] recipe fetch failed: ${recipeId}`, fetchError?.message);
    // フェッチ失敗時も failed に更新してポーリングを止める
    await supabase
      .from('recipes')
      .update({ extraction_status: 'failed' })
      .eq('id', recipeId);
    return;
  }

  const rawDescription = (recipe.raw_description as string | null) ?? '';
  console.log(`[Phase2] raw_description length: ${rawDescription.length} chars`);

  const context = buildPhase2Context({
    title: recipe.title as string,
    rawDescription: rawDescription || (recipe.title as string),
    phase1Ingredients: (recipe.ingredients as Array<{ name: string }>) ?? [],
  });

  try {
    const structured = await structureRecipeWithClaude(recipe.title as string, context);
    const normalized = normalizeRecipe(structured);

    console.log(`[Phase2] structured: ${normalized.ingredients.length} ingredients, ${normalized.steps.length} steps`);

    // Phase 2 が 0 件を返した場合は Phase 1 の食材を保持する（上書きしない）
    const finalIngredients =
      normalized.ingredients.length > 0
        ? normalized.ingredients
        : ((recipe.ingredients as Array<{ name: string }>) ?? []);

    console.log(`[Phase2] final ingredients: ${finalIngredients.length} (phase2: ${normalized.ingredients.length}, phase1 fallback: ${finalIngredients === normalized.ingredients ? 'no' : 'yes'})`);

    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        phase: 'phase2',
        extraction_status: 'done',
        ingredients: finalIngredients,
        steps: normalized.steps,
        tags: normalized.tags,
        cook_time_minutes: normalized.cookTimeMinutes ?? recipe.cook_time_minutes,
      })
      .eq('id', recipeId);

    if (updateError) {
      throw new Error(`DB update failed: ${updateError.message}`);
    }

    console.log(`[Phase2] done: ${recipeId}`);
  } catch (err) {
    console.error(`[Phase2] failed: ${recipeId}`, err);
    await supabase
      .from('recipes')
      .update({ extraction_status: 'failed' })
      .eq('id', recipeId);
  }
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
