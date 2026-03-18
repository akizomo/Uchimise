import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';
import type { MealSlot } from './useMealPlans';

interface AddToMealInput {
  recipeId: string;
  plannedDate: string;
  mealSlot: MealSlot;
}

interface AddToMealResponse {
  success: boolean;
  error?: string;
}

export function useAddToMeal() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AddToMealInput>({
    mutationFn: async ({ recipeId, plannedDate, mealSlot }) => {
      await apiFetch<AddToMealResponse>('/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify({ recipeId, plannedDate, mealSlot }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}
