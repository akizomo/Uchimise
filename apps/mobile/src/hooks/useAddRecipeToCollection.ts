import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

interface AddRecipeToCollectionInput {
  collectionId: string;
  recipeId: string;
}

interface AddRecipeToCollectionResponse {
  success: boolean;
  error?: string;
}

export function useAddRecipeToCollection() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AddRecipeToCollectionInput>({
    mutationFn: async ({ collectionId, recipeId }) => {
      await apiFetch<AddRecipeToCollectionResponse>(
        `/api/collections/${collectionId}/recipes`,
        {
          method: 'POST',
          body: JSON.stringify({ recipeId }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}
