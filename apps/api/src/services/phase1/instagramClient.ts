export class InstagramPrivatePostError extends Error {
  constructor() {
    super('Instagram post is private or inaccessible');
    this.name = 'InstagramPrivatePostError';
  }
}

export interface InstagramMediaData {
  mediaId: string;
  caption: string;
  thumbnailUrl: string;
  permalink: string;
}

// Extract Instagram media ID from URL
function extractMediaId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

export async function fetchInstagramMedia(url: string): Promise<InstagramMediaData> {
  const mediaId = extractMediaId(url);
  if (!mediaId) {
    throw new Error('Invalid Instagram URL');
  }

  const accessToken = process.env.INSTAGRAM_APP_ID
    ? `${process.env.INSTAGRAM_APP_ID}|${process.env.INSTAGRAM_APP_SECRET}`
    : null;

  if (!accessToken) {
    // Fallback: try oEmbed (no auth required, limited data)
    return fetchInstagramOEmbed(url, mediaId);
  }

  const apiUrl = `https://graph.instagram.com/${mediaId}?fields=id,caption,media_url,thumbnail_url,permalink`;

  // Pass token in Authorization header to prevent it appearing in server/proxy logs
  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 400 || response.status === 403) {
    throw new InstagramPrivatePostError();
  }

  const data = await response.json() as {
    id?: string;
    caption?: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    error?: { code: number };
  };

  if (data.error?.code === 10 || data.error?.code === 190) {
    throw new InstagramPrivatePostError();
  }

  return {
    mediaId: data.id ?? mediaId,
    caption: data.caption ?? '',
    thumbnailUrl: data.thumbnail_url ?? data.media_url ?? '',
    permalink: data.permalink ?? url,
  };
}

async function fetchInstagramOEmbed(url: string, mediaId: string): Promise<InstagramMediaData> {
  const oEmbedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`;
  const response = await fetch(oEmbedUrl);

  if (!response.ok) {
    throw new InstagramPrivatePostError();
  }

  const data = await response.json() as {
    title?: string;
    thumbnail_url?: string;
    author_name?: string;
  };

  return {
    mediaId,
    caption: data.title ?? '',
    thumbnailUrl: data.thumbnail_url ?? '',
    permalink: url,
  };
}
