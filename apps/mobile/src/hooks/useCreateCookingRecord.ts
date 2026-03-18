import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

interface CreateCookingRecordInput {
  recipeId: string;
  note?: string;
}

export function useCreateCookingRecord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateCookingRecordInput>({
    mutationFn: async ({ recipeId, note }) => {
      await apiFetch('/api/cooking-records', {
        method: 'POST',
        body: JSON.stringify({
          recipeId,
          note,
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cooking-records'] });
    },
  });
}

