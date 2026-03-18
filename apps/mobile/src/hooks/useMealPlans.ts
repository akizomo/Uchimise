import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface MealPlanRecipe {
  id: string;
  title: string;
  source_url: string;
  source_type: 'youtube' | 'instagram';
  creator_name: string | null;
  thumbnail_url: string | null;
  cook_time_minutes: number | null;
  extraction_status: 'pending' | 'done' | 'failed';
  ingredients: Array<{ name: string; amount?: string; unit?: string; isSubstituted?: boolean }>;
  steps: Array<{ order: number; text: string }>;
  tags: string[];
}

export interface MealPlan {
  id: string;
  recipe_id: string;
  planned_date: string;
  meal_slot: MealSlot;
  created_at: string;
  recipes: MealPlanRecipe;
}

interface MealPlansResponse {
  success: boolean;
  data: MealPlan[];
}

// --- Utilities ---

/** Returns YYYY-MM-DD string for a given Date (local time) */
export function toDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns the Sunday of the week containing the given date */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return toDateString(d);
}

/** Returns the current meal slot based on the hour of day */
export function getCurrentMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  return 'dinner';
}

/** Human-readable label for a meal slot */
export function getMealSlotLabel(slot: MealSlot): string {
  const labels: Record<MealSlot, string> = {
    breakfast: '朝ごはん',
    lunch: '昼ごはん',
    dinner: '夕ごはん',
  };
  return labels[slot];
}

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

// --- Hook ---

export function useMealPlans(weekStart: string) {
  return useQuery({
    queryKey: ['meal-plans', weekStart],
    queryFn: async () => {
      const result = await apiFetch<MealPlansResponse>(
        `/api/meal-plans?weekStart=${weekStart}`
      );
      if (!result.success) throw new Error('Failed to fetch meal plans');
      return result.data;
    },
    enabled: !!weekStart,
  });
}
