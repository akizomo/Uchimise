import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  steps: Array<{
    order: number;
    text: string;
    /** Phase 2 で検出された加熱・待機時間（秒）。なければ null */
    timer_seconds?: number | null;
  }>;
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
    // Phase 2 処理中はポーリングで自動更新（Realtime の補完）
    refetchInterval: (query) => {
      if (query.state.data?.extraction_status === 'pending') return 3000;
      return false;
    },
  });
}

/**
 * Phase 2 の再試行。extraction_status を pending に戻してキューに再投入する。
 */
export function useRetryPhase2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      await apiFetch(`/api/recipes/${recipeId}/retry-phase2`, { method: 'POST' });
    },
    onSuccess: (_data, recipeId) => {
      // キャッシュを更新して即座に pending 状態に見せる
      queryClient.setQueryData<RecipeDetail>(['recipes', recipeId], (old) =>
        old ? { ...old, extraction_status: 'pending' } : old,
      );
    },
  });
}

/**
 * レシピを棚から取り出す（削除）。
 * Phase 2 が失敗したときに「保存しない」選択肢として使用。
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' });
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['recipes', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

