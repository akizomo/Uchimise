import { Hono } from 'hono';
import type { AppEnv } from '../types/hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';

const collectionsRoute = new Hono<AppEnv>();

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
});

const addRecipeSchema = z.object({
  recipeId: z.string().uuid(),
  position: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  recipeIds: z.array(z.string().uuid()),
});

// GET /api/collections
collectionsRoute.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_recipes(recipe_id, position)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return c.json({ success: false, error: 'Failed to fetch collections' }, 500);
  return c.json({ success: true, data });
});

// POST /api/collections
collectionsRoute.post('/', zValidator('json', createCollectionSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { name } = c.req.valid('json');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: userId, name, is_auto: false })
    .select()
    .single();

  if (error || !data) return c.json({ success: false, error: 'Failed to create collection' }, 500);
  return c.json({ success: true, data }, 201);
});

// DELETE /api/collections/:id
collectionsRoute.delete('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return c.json({ success: false, error: 'Failed to delete collection' }, 500);
  return c.json({ success: true });
});

// POST /api/collections/:id/recipes — add recipe to collection
collectionsRoute.post('/:id/recipes', zValidator('json', addRecipeSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { id: collectionId } = c.req.param();
  const { recipeId, position = 0 } = c.req.valid('json');
  const supabase = createAdminClient();

  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (!collection) return c.json({ success: false, error: 'Collection not found' }, 404);

  const { error } = await supabase
    .from('collection_recipes')
    .insert({ collection_id: collectionId, recipe_id: recipeId, position });

  if (error) return c.json({ success: false, error: 'Failed to add recipe' }, 500);
  return c.json({ success: true }, 201);
});

// DELETE /api/collections/:id/recipes/:recipeId
collectionsRoute.delete('/:id/recipes/:recipeId', async (c) => {
  const userId = c.get('userId') as string;
  const { id: collectionId, recipeId } = c.req.param();
  const supabase = createAdminClient();

  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (!collection) return c.json({ success: false, error: 'Collection not found' }, 404);

  const { error } = await supabase
    .from('collection_recipes')
    .delete()
    .eq('collection_id', collectionId)
    .eq('recipe_id', recipeId);

  if (error) return c.json({ success: false, error: 'Failed to remove recipe' }, 500);
  return c.json({ success: true });
});

// PATCH /api/collections/:id/recipes/reorder
collectionsRoute.patch('/:id/recipes/reorder', zValidator('json', reorderSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { id: collectionId } = c.req.param();
  const { recipeIds } = c.req.valid('json');
  const supabase = createAdminClient();

  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (!collection) return c.json({ success: false, error: 'Collection not found' }, 404);

  // Update positions for each recipe
  const updates = recipeIds.map((recipeId, idx) =>
    supabase
      .from('collection_recipes')
      .update({ position: idx })
      .eq('collection_id', collectionId)
      .eq('recipe_id', recipeId)
  );

  await Promise.all(updates);
  return c.json({ success: true });
});

export { collectionsRoute };
