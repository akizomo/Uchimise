import { Worker, type Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

import { createAdminClient } from '../db/supabaseAdmin';
import { structureRecipeWithClaude, ClaudeApiError } from '../services/phase2/claudeClient';
import { buildPhase2Context } from '../services/phase2/promptBuilder';
import { normalizeRecipe } from '../services/phase2/normalizer';
import { Phase2JobData } from './queue';

const MAX_CONCURRENCY = 5;

export function startPhase2Worker(): Worker<Phase2JobData> {
  const worker = new Worker<Phase2JobData>(
    'phase2',
    async (job) => {
      const { recipeId, userId } = job.data;
      const supabase = createAdminClient();

      // Fetch the current recipe
      const { data: recipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`);
      }

      // Build context for Claude
      const context = buildPhase2Context({
        title: recipe.title as string,
        rawDescription: (recipe.raw_description as string) ?? recipe.title as string,
        phase1Ingredients: (recipe.ingredients as Array<{ name: string }>) ?? [],
      });

      // Call Claude API
      const structured = await structureRecipeWithClaude(
        recipe.title as string,
        context
      );

      const normalized = normalizeRecipe(structured);

      // Update recipe to phase2
      const updateData = {
        phase: 'phase2' as const,
        extraction_status: 'done' as const,
        ingredients: normalized.ingredients,
        steps: normalized.steps,
        tags: normalized.tags,
        cook_time_minutes: normalized.cookTimeMinutes ?? recipe.cook_time_minutes,
      };

      const { error: updateError } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', recipeId);

      if (updateError) {
        throw new Error(`Failed to update recipe: ${updateError.message}`);
      }

      // Broadcast Realtime event via Supabase channel
      const supabaseUrl = process.env.SUPABASE_URL ?? '';
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
      const realtimeClient = createClient(supabaseUrl, serviceKey);

      await realtimeClient.channel(`user:${userId}`).send({
        type: 'broadcast',
        event: 'phase2_complete',
        payload: {
          recipeId,
          isUnconfirmed: normalized.isUnconfirmed,
        },
      });

      // Push notification (Expo)
      await sendPushNotification(userId, recipeId);
    },
    {
      connection: {
        host: process.env.UPSTASH_REDIS_REST_URL ?? '',
      },
      concurrency: MAX_CONCURRENCY,
    }
  );

  worker.on('failed', async (job: Job<Phase2JobData> | undefined, error: Error) => {
    if (!job) return;

    // On final failure (no retries left), mark as failed but preserve phase1 data
    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      const supabase = createAdminClient();
      await supabase
        .from('recipes')
        .update({ extraction_status: 'failed' })
        .eq('id', job.data.recipeId);
    }
  });

  return worker;
}

async function sendPushNotification(userId: string, recipeId: string): Promise<void> {
  const supabase = createAdminClient();

  // Fetch user's push token (stored in a user_push_tokens table in production)
  // For now, this is a stub that can be wired up once expo token registration is implemented
  const pushToken = await getUserPushToken(supabase, userId);
  if (!pushToken) return;

  const message = {
    to: pushToken,
    sound: 'default',
    title: 'Uchimise',
    // No exclamation mark — brand guideline
    body: '材料と手順が整理されました。',
    data: { recipeId },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

async function getUserPushToken(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<string | null> {
  // TODO(sprint8): wire up after Expo token registration is implemented in mobile
  return null;
}
