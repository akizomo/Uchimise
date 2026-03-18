import type { PatternKey } from './config/patternTags';

export interface YoutubeSearchResultItem {
  platformId: string;
  canonicalUrl: string;
  title: string;
  creatorName: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  pattern: PatternKey;
  query: string;
}

interface YoutubeSearchApiItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
  };
}

interface YoutubeSearchApiResponse {
  items?: YoutubeSearchApiItem[];
}

function buildYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function searchYoutubeByKeyword(params: {
  pattern: PatternKey;
  query: string;
  maxResults: number;
  publishedAfter?: string; // ISO
}): Promise<YoutubeSearchResultItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('q', params.query);
  url.searchParams.set('maxResults', String(params.maxResults));
  url.searchParams.set('key', apiKey);
  // Light relevance tuning: newer content tends to work better for discovery.
  url.searchParams.set('order', 'date');
  if (params.publishedAfter) url.searchParams.set('publishedAfter', params.publishedAfter);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const json = (await res.json()) as YoutubeSearchApiResponse;
  const items = json.items ?? [];

  return items
    .map((item) => {
      const videoId = item.id?.videoId;
      if (!videoId) return null;

      const canonicalUrl = buildYoutubeWatchUrl(videoId);
      const title = item.snippet?.title ?? canonicalUrl;
      const creatorName = item.snippet?.channelTitle ?? null;
      const publishedAt = item.snippet?.publishedAt ?? null;
      const thumbnailUrl =
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        null;

      return {
        platformId: videoId,
        canonicalUrl,
        title,
        creatorName,
        thumbnailUrl,
        publishedAt,
        pattern: params.pattern,
        query: params.query,
      } satisfies YoutubeSearchResultItem;
    })
    .filter((v): v is YoutubeSearchResultItem => v !== null);
}

