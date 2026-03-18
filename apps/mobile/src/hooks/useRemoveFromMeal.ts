import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

interface RemoveFromMealResponse {
  success: boolean;
}

export function useRemoveFromMeal() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (mealPlanId) => {
      await apiFetch<RemoveFromMealResponse>(`/api/meal-plans/${mealPlanId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}
