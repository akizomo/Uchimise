export interface YoutubeMeta {
  title: string;
  thumbnailUrl: string | null;
  creatorName: string | null;
  platformId: string | null;
  canonicalUrl: string;
}

function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '').trim();
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Lightweight metadata fetch without API key.
 * Uses YouTube oEmbed endpoint (works for public videos).
 */
export async function fetchYoutubeMeta(url: string): Promise<YoutubeMeta> {
  const videoId = extractYoutubeVideoId(url);
  const canonicalUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;

  if (!videoId) {
    return {
      title: url,
      thumbnailUrl: null,
      creatorName: null,
      platformId: null,
      canonicalUrl,
    };
  }

  const oembedUrl = new URL('https://www.youtube.com/oembed');
  oembedUrl.searchParams.set('url', canonicalUrl);
  oembedUrl.searchParams.set('format', 'json');

  const res = await fetch(oembedUrl.toString());
  if (!res.ok) {
    return {
      title: canonicalUrl,
      thumbnailUrl: buildYoutubeThumbnailUrl(videoId),
      creatorName: null,
      platformId: videoId,
      canonicalUrl,
    };
  }

  const json = (await res.json()) as { title?: string; author_name?: string };

  return {
    title: json.title ?? canonicalUrl,
    thumbnailUrl: buildYoutubeThumbnailUrl(videoId),
    creatorName: json.author_name ?? null,
    platformId: videoId,
    canonicalUrl,
  };
}

