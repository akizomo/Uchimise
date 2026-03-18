import { createAdminClient } from '../../db/supabaseAdmin';
import type { YouTubeChannelConfig, IngestionResult } from '../../types/feedIngestion';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const EMBEDDING_DIMENSIONS = 1536;

interface YouTubeChannelItem {
  id: string;
  contentDetails?: {
    relatedPlaylists: {
      uploads: string;
    };
  };
}

interface YouTubeChannelsResponse {
  items?: YouTubeChannelItem[];
}

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistItemsResponse {
  items?: YouTubePlaylistItem[];
}

async function resolveChannelId(handle: string, apiKey: string): Promise<string | null> {
  // 1st attempt: forHandle with @ (e.g. @sirogohan)
  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set('part', 'id');
  url.searchParams.set('forHandle', handle);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube API error (channels.list forHandle=${handle}): ${res.status}`);
  }

  const data = (await res.json()) as YouTubeChannelsResponse;
  if (data.items?.[0]?.id) {
    return data.items[0].id;
  }

  // 2nd attempt: forUsername with stripped @ (旧フォーマット対応)
  const username = handle.replace(/^@/, '');
  const url2 = new URL(`${YOUTUBE_API_BASE}/channels`);
  url2.searchParams.set('part', 'id');
  url2.searchParams.set('forUsername', username);
  url2.searchParams.set('key', apiKey);

  const res2 = await fetch(url2.toString());
  if (!res2.ok) {
    throw new Error(`YouTube API error (channels.list forUsername=${username}): ${res2.status}`);
  }

  const data2 = (await res2.json()) as YouTubeChannelsResponse;
  return data2.items?.[0]?.id ?? null;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string | null> {
  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', channelId);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube API error (channels.list contentDetails id=${channelId}): ${res.status}`);
  }

  const data = (await res.json()) as YouTubeChannelsResponse;
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists.uploads;
  if (uploadsId) return uploadsId;

  // Fallback: uploads playlist ID = channel ID with "UC" → "UU"
  if (channelId.startsWith('UC')) {
    return 'UU' + channelId.slice(2);
  }
  return null;
}

async function fetchPlaylistItems(
  playlistId: string,
  maxResults: number,
  apiKey: string
): Promise<YouTubePlaylistItem[]> {
  const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('playlistId', playlistId);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube API error (playlistItems.list playlistId=${playlistId}): ${res.status}`);
  }

  const data = (await res.json()) as YouTubePlaylistItemsResponse;
  return data.items ?? [];
}

export async function ingestChannel(
  channel: YouTubeChannelConfig,
  apiKey: string
): Promise<IngestionResult> {
  try {
    // 1. channelId が null なら forHandle で解決
    let channelId = channel.channelId;
    if (!channelId) {
      channelId = await resolveChannelId(channel.handle, apiKey);
      if (!channelId) {
        return {
          inserted: 0,
          skipped: 0,
          error: `Could not resolve channelId for handle: ${channel.handle}`,
        };
      }
    }

    // 2. uploadsPlaylistId を取得
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId, apiKey);
    if (!uploadsPlaylistId) {
      return {
        inserted: 0,
        skipped: 0,
        error: `Could not get uploadsPlaylistId for channelId: ${channelId}`,
      };
    }

    // 3. 最新動画を取得
    const items = await fetchPlaylistItems(uploadsPlaylistId, channel.maxResults, apiKey);
    if (items.length === 0) {
      return { inserted: 0, skipped: 0 };
    }

    // 4. upsert 用データを構築
    // embedding は Phase2 で後から更新するためゼロベクトルで初期化
    const zeroEmbedding = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);

    const rows = items.map((item) => {
      const videoId = item.snippet.resourceId.videoId;
      const sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return {
        title: item.snippet.title,
        source_url: sourceUrl,
        source_type: 'youtube' as const,
        creator_name: channel.name,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        tags: channel.tags,
        published_at: item.snippet.publishedAt,
        canonical_url: sourceUrl,
        platform_id: videoId,
        embedding: zeroEmbedding,
      };
    });

    // 5. upsert — ON CONFLICT (canonical_url) DO NOTHING
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('feed_content')
      .upsert(rows, { onConflict: 'canonical_url', ignoreDuplicates: true })
      .select('id');

    if (error) {
      return { inserted: 0, skipped: rows.length, error: error.message };
    }

    const inserted = data?.length ?? 0;
    const skipped = rows.length - inserted;
    return { inserted, skipped };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { inserted: 0, skipped: 0, error: message };
  }
}
