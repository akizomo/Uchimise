import { Hono } from 'hono';
import type { AppEnv } from '../types/hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';

const mealPlansRoute = new Hono<AppEnv>();

const createMealPlanSchema = z.object({
  recipeId: z.string().uuid(),
  plannedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealSlot: z.enum(['breakfast', 'lunch', 'dinner']),
});

const weekQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/meal-plans?weekStart=YYYY-MM-DD
mealPlansRoute.get('/', zValidator('query', weekQuerySchema), async (c) => {
  const userId = c.get('userId') as string;
  const { weekStart } = c.req.valid('query');
  const supabase = createAdminClient();

  // Calculate week end (7 days)
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekEnd = end.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, recipes(*)')
    .eq('user_id', userId)
    .gte('planned_date', weekStart)
    .lte('planned_date', weekEnd)
    .order('planned_date', { ascending: true });

  if (error) return c.json({ success: false, error: 'Failed to fetch meal plans' }, 500);
  return c.json({ success: true, data });
});

// POST /api/meal-plans
mealPlansRoute.post('/', zValidator('json', createMealPlanSchema), async (c) => {
  const userId = c.get('userId') as string;
  const { recipeId, plannedDate, mealSlot } = c.req.valid('json');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('meal_plans')
    .insert({ user_id: userId, recipe_id: recipeId, planned_date: plannedDate, meal_slot: mealSlot })
    .select()
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      return c.json({ success: false, error: 'Meal slot already occupied' }, 409);
    }
    return c.json({ success: false, error: 'Failed to create meal plan' }, 500);
  }

  return c.json({ success: true, data }, 201);
});

// DELETE /api/meal-plans/:id
mealPlansRoute.delete('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const { id } = c.req.param();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return c.json({ success: false, error: 'Failed to delete meal plan' }, 500);
  return c.json({ success: true });
});

export { mealPlansRoute };
