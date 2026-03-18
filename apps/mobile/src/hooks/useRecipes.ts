import { useQuery } from '@tanstack/react-query';

// Local type mirror of apps/api/src/types/index.ts
interface Recipe {
  id: string;
  user_id: string;
  title: string;
  source_url: string;
  source_type: 'youtube' | 'instagram';
  creator_name: string | null;
  thumbnail_url: string | null;
  cook_time_minutes: number | null;
  phase: 'phase1' | 'phase2' | 'manual';
  extraction_status: 'pending' | 'done' | 'failed';
  ingredients: Array<{ name: string; amount?: string; unit?: string; isSubstituted?: boolean }>;
  steps: Array<{ order: number; text: string }>;
  tags: string[];
  created_at: string;
}

import { apiFetch } from '../lib/apiClient';

interface RecipesResponse {
  success: boolean;
  data: Recipe[];
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const result = await apiFetch<RecipesResponse>('/api/recipes');

      if (!result.success) {
        throw new Error('Failed to fetch recipes');
      }

      return result.data;
    },
  });
}

