import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';
import { enqueuePhase2 } from '../jobs/queue';
import type { AppEnv } from '../types/hono';

const recipesRoute = new Hono<AppEnv>();

const updateRecipeSchema = z.object({
  title: z.string().min(1).optional(),
  cookTimeMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional(),
      unit: z.string().optional(),
      isSubstituted: z.boolean().optional(),
    })
  ).optional(),
  steps: z.array(
    z.object({
      order: z.number().int(),
      text: z.string(),
    })
  ).optional(),
});

// GET /api/recipes — list user's recipes
recipesRoute.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: 'Failed to fetch recipes' }, 500);
  }

  return c.json({ success: true, data });
});

// GET /api/recipes/:id
recipesRoute.get('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Recipe not found' }, 404);
  }

  return c.json({ success: true, data });
});

// PATCH /api/recipes/:id
recipesRoute.patch('/:id', zValidator('json', updateRecipeSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const body = c.req.valid('json');
  const supabase = createAdminClient();

  // Map camelCase to snake_case
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.cookTimeMinutes !== undefined) updateData.cook_time_minutes = body.cookTimeMinutes;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.ingredients !== undefined) updateData.ingredients = body.ingredients;
  if (body.steps !== undefined) updateData.steps = body.steps;

  const { data, error } = await supabase
    .from('recipes')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Failed to update recipe' }, 500);
  }

  return c.json({ success: true, data });
});

// POST /api/recipes/:id/retry-phase2
recipesRoute.post('/:id/retry-phase2', async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const supabase = createAdminClient();

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('id, extraction_status')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !recipe) {
    return c.json({ success: false, error: 'Recipe not found' }, 404);
  }

  if (recipe.extraction_status === 'done') {
    return c.json({ success: true }, 200);
  }

  // Reset to pending before re-enqueueing
  await supabase
    .from('recipes')
    .update({ extraction_status: 'pending' })
    .eq('id', id);

  await enqueuePhase2({ recipeId: id, userId });

  return c.json({ success: true }, 200);
});

// DELETE /api/recipes/:id
recipesRoute.delete('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return c.json({ success: false, error: 'Failed to delete recipe' }, 500);
  }

  return c.json({ success: true });
});

export { recipesRoute };
