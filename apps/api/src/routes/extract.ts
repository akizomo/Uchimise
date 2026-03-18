import { Hono } from 'hono';
import type { AppEnv } from '../types/hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';
import { enqueuePhase2 } from '../jobs/queue';
import { fetchYouTubeVideo, YouTubeQuotaExceededError } from '../services/phase1/youtubeClient';
import { fetchInstagramMedia, InstagramPrivatePostError } from '../services/phase1/instagramClient';
import { roughExtract } from '../services/phase1/roughExtractor';

const extractRoute = new Hono<AppEnv>();

const extractSchema = z.object({
  url: z.string().url(),
});

function detectSourceType(url: string): 'youtube' | 'instagram' | null {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  return null;
}

extractRoute.post('/', zValidator('json', extractSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { url } = c.req.valid('json');
  const supabase = createAdminClient();

  // Check for duplicate URL
  const { data: existing } = await supabase
    .from('recipes')
    .select('id')
    .eq('user_id', userId)
    .eq('source_url', url)
    .single();

  if (existing) {
    return c.json({ success: true, code: 'already_saved', recipeId: existing.id }, 200);
  }

  const sourceType = detectSourceType(url);
  if (!sourceType) {
    return c.json({ success: false, error: 'extraction_failed', message: 'Unsupported URL' }, 500);
  }

  try {
    let title = '';
    let creatorName = '';
    let thumbnailUrl = '';
    let descriptionText = '';
    let cookTimeMinutes: number | undefined;

    if (sourceType === 'youtube') {
      const videoData = await fetchYouTubeVideo(url);
      title = videoData.title;
      creatorName = videoData.channelTitle;
      thumbnailUrl = videoData.thumbnailUrl;
      // 字幕があれば優先、なければ説明文にフォールバック
      descriptionText = videoData.transcript || videoData.description;
      console.log(`[Extract] transcript: ${videoData.transcript.length}文字, description: ${videoData.description.length}文字`);
      cookTimeMinutes = Math.round(videoData.durationSeconds / 60);
    } else {
      const mediaData = await fetchInstagramMedia(url);
      title = mediaData.caption.slice(0, 100) || 'Instagram レシピ';
      creatorName = '';
      thumbnailUrl = mediaData.thumbnailUrl;
      descriptionText = mediaData.caption;
    }

    const extraction = roughExtract(descriptionText);

    const isManualRequired = !extraction.hasIngredientSection && sourceType === 'instagram';
    const ingredients = isManualRequired ? [] : extraction.ingredientNames.map((name) => ({ name }));
    const finalCookTime = extraction.cookTimeMinutes ?? cookTimeMinutes;

    // Insert Phase 1 recipe (always, even for manual_required)
    const { data: recipe, error: insertError } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        title,
        source_url: url,
        source_type: sourceType,
        creator_name: creatorName,
        thumbnail_url: thumbnailUrl,
        cook_time_minutes: finalCookTime,
        raw_description: descriptionText,
        phase: isManualRequired ? 'manual' : 'phase1',
        extraction_status: isManualRequired ? 'failed' : 'pending',
        ingredients,
        steps: [],
        tags: [],
      })
      .select()
      .single();

    if (insertError || !recipe) {
      return c.json({ success: false, error: 'extraction_failed' }, 500);
    }

    if (isManualRequired) {
      return c.json({ success: true, code: 'manual_required', data: recipe }, 201);
    }

    // Enqueue Phase 2 job (best-effort — don't fail the request if this fails)
    try {
      await enqueuePhase2({ recipeId: recipe.id, userId });
    } catch {
      // Phase 2 enqueue failure is non-fatal for Phase 1 response
    }

    return c.json({ success: true, data: recipe }, 201);

  } catch (error) {
    if (error instanceof InstagramPrivatePostError) {
      return c.json({ success: false, error: 'private_post' }, 422);
    }
    if (error instanceof YouTubeQuotaExceededError) {
      return c.json({ success: false, error: 'quota_exceeded' }, 503);
    }
    return c.json({ success: false, error: 'extraction_failed' }, 500);
  }
});

export { extractRoute };
