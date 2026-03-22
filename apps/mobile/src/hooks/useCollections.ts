import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

interface Collection {
  id: string;
  name: string;
  recipe_count: number;
  preview_thumbnails?: string[];
  is_auto?: boolean;
  created_at: string;
}

interface CollectionDetailRecipe {
  id: string;
  title: string;
  thumbnail_url: string | null;
  source_type: 'youtube' | 'instagram';
  cook_time_minutes: number | null;
  creator_name: string | null;
}

interface CollectionDetail extends Collection {
  recipes: CollectionDetailRecipe[];
}

interface CollectionsResponse<T> {
  success: boolean;
  data: T;
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const result = await apiFetch<CollectionsResponse<Collection[]>>('/api/collections');

      if (!result.success) {
        throw new Error('Failed to fetch collections');
      }

      return result.data;
    },
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collections', id],
    queryFn: async () => {
      const result = await apiFetch<CollectionsResponse<CollectionDetail>>(
        `/api/collections/${id}`,
      );

      if (!result.success) {
        throw new Error('Failed to fetch collection');
      }

      return result.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string }) => {
      const result = await apiFetch<CollectionsResponse<Collection>>('/api/collections', {
        method: 'POST',
        body: JSON.stringify({ name: input.name }),
      });

      if (!result.success) {
        throw new Error('Failed to create collection');
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiFetch<CollectionsResponse<null>>(`/api/collections/${id}`, {
        method: 'DELETE',
      });

      if (!result.success) {
        throw new Error('Failed to delete collection');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

