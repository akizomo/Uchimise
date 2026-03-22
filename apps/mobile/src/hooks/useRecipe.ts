import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

export interface RecipeDetail {
  id: string;
  title: string;
  source_url: string;
  source_type: 'youtube' | 'instagram';
  creator_name: string | null;
  thumbnail_url: string | null;
  cook_time_minutes: number | null;
  extraction_status: 'pending' | 'done' | 'failed';
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    isSubstituted: boolean;
    /** Phase 2 で抽出された代替食材候補。未取得時は undefined */
    alternatives?: string[];
  }>;
  steps: Array<{ order: number; text: string }>;
  tags: string[];
}

interface RecipeDetailResponse {
  success: boolean;
  data: RecipeDetail;
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      const result = await apiFetch<RecipeDetailResponse>(`/api/recipes/${id}`);

      if (!result.success) {
        throw new Error('Failed to fetch recipe');
      }

      return result.data;
    },
    enabled: Boolean(id),
  });
}

