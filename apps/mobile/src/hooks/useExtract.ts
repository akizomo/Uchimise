import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

export type ExtractErrorCode =
  | 'private_post'
  | 'already_saved'
  | 'manual_required'
  | 'quota_exceeded'
  | 'extraction_failed';

export interface ExtractResult {
  success: boolean;
  code?: ExtractErrorCode;
  // already_saved: 既存レシピID
  recipeId?: string;
  // manual_required: Phase 1 のタイトル・サムネイルだけ返る
  data?: {
    id?: string;
    title: string;
    thumbnail_url: string | null;
    source_type: 'youtube' | 'instagram';
    creator_name: string | null;
    cook_time_minutes: number | null;
    phase: 'phase1' | 'phase2' | 'manual';
    extraction_status: 'pending' | 'done' | 'failed';
    ingredients: Array<{ name: string }>;
    tags: string[];
  };
  error?: ExtractErrorCode;
}

export function useExtract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) =>
      apiFetch<ExtractResult>('/api/extract', {
        method: 'POST',
        body: JSON.stringify({ url }),
      }),
    onSuccess: (result) => {
      // Phase 1 保存成功時にレシピ一覧を invalidate
      if (result.success && result.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
      }
    },
  });
}
