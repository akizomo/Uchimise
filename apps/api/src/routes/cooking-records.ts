import { Hono } from 'hono';
import type { AppEnv } from '../types/hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';

const cookingRecordsRoute = new Hono<AppEnv>();

const createRecordSchema = z.object({
  recipeId: z.string().uuid(),
  cookedAt: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
});

// POST /api/cooking-records
cookingRecordsRoute.post('/', zValidator('json', createRecordSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { recipeId, cookedAt, note } = c.req.valid('json');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('cooking_records')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      cooked_at: cookedAt ?? new Date().toISOString(),
      note,
    })
    .select()
    .single();

  if (error || !data) return c.json({ success: false, error: 'Failed to create cooking record' }, 500);
  return c.json({ success: true, data }, 201);
});

// GET /api/cooking-records
cookingRecordsRoute.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('cooking_records')
    .select('*, recipes(title, thumbnail_url, source_type)')
    .eq('user_id', userId)
    .order('cooked_at', { ascending: false })
    .limit(50);

  if (error) return c.json({ success: false, error: 'Failed to fetch cooking records' }, 500);
  return c.json({ success: true, data });
});

export { cookingRecordsRoute };
