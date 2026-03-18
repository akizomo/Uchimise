import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';
import type { FeedItem } from './useFeed';

export function useFeedItem(id: string) {
  return useQuery({
    queryKey: ['feed', id],
    queryFn: () =>
      apiFetch<{ success: true; data: FeedItem }>(`/api/feed/${id}`).then(
        (res) => res.data
      ),
    enabled: !!id,
  });
}
