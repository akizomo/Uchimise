import { useInfiniteQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/apiClient';

// Matches the FeedItem shape returned by apps/api/src/services/feed/vectorSearch.ts
export interface FeedItem {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: 'youtube' | 'instagram';
  creatorName: string;
  thumbnailUrl: string;
  tags: string[];
  publishedAt: string;
}

interface FeedPage {
  success: boolean;
  data?: FeedItem[];
  pagination?: { nextCursor: string | null };
  error?: string;
}

async function fetchFeedPage(
  cursor: string | undefined,
  tags: string[] | undefined
): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (tags?.length) params.set('tags', tags.join(','));

  const qs = params.toString();
  const path = `/api/feed${qs ? `?${qs}` : ''}`;

  const result = await apiFetch<FeedPage>(path);

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to fetch feed');
  }

  return {
    success: true,
    data: result.data ?? [],
    pagination: result.pagination ?? { nextCursor: null },
  };
}

export function useFeed(tags?: string[], enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['feed', tags],
    queryFn: ({ pageParam }) =>
      fetchFeedPage(pageParam as string | undefined, tags),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.nextCursor ?? undefined,
    enabled,
  });
}
