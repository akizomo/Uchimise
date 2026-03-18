import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

interface CookingRecordWithRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  cooked_at: string;
  note: string | null;
  recipes: {
    title: string;
    thumbnail_url: string | null;
    source_type: 'youtube' | 'instagram';
  } | null;
}

interface CookingRecordsResponse {
  success: boolean;
  data: CookingRecordWithRecipe[];
}

export function useCookingRecords() {
  return useQuery({
    queryKey: ['cooking-records'],
    queryFn: async () => {
      const result = await apiFetch<CookingRecordsResponse>('/api/cooking-records');

      if (!result.success) {
        throw new Error('Failed to fetch cooking records');
      }

      return result.data;
    },
  });
}
