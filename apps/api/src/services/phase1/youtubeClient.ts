import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';

const VIDEO_API_BASE = 'https://www.googleapis.com/youtube/v3';

// YouTube video ID extraction pattern
const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export class YouTubeQuotaExceededError extends Error {
  constructor() {
    super('YouTube API quota exceeded');
    this.name = 'YouTubeQuotaExceededError';
  }
}

export class YouTubeVideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`YouTube video not found: ${videoId}`);
    this.name = 'YouTubeVideoNotFoundError';
  }
}

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  transcript: string;
  thumbnailUrl: string;
  channelTitle: string;
  durationSeconds: number;
}

const YouTubeVideoItemSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      maxres: z.object({ url: z.string() }).optional(),
      high: z.object({ url: z.string() }).optional(),
      default: z.object({ url: z.string() }),
    }),
    channelTitle: z.string(),
  }),
  contentDetails: z.object({
    duration: z.string(), // ISO 8601 duration
  }),
});

const YouTubeApiResponseSchema = z.object({
  items: z.array(YouTubeVideoItemSchema),
  error: z.object({ code: z.number(), message: z.string() }).optional(),
});

function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// Parse ISO 8601 duration to seconds (e.g. PT4M13S → 253)
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0');
  const minutes = parseInt(match[2] ?? '0');
  const seconds = parseInt(match[3] ?? '0');
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeVideo(url: string): Promise<YouTubeVideoData> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not configured');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const apiUrl = `${VIDEO_API_BASE}/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const data = await response.json() as unknown;

  const parsed = YouTubeApiResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Failed to parse YouTube API response');
  }

  // Quota exceeded returns 403
  if (response.status === 403 || parsed.data.error?.code === 403) {
    throw new YouTubeQuotaExceededError();
  }

  const item = parsed.data.items[0];
  if (!item) {
    throw new YouTubeVideoNotFoundError(videoId);
  }

  const thumbnail =
    item.snippet.thumbnails.maxres?.url ??
    item.snippet.thumbnails.high?.url ??
    item.snippet.thumbnails.default.url;

  // 字幕・トランスクリプトを取得（失敗しても非致命的）
  let transcript = '';
  try {
    // ja → ja-JP → 言語指定なし の順でフォールバック
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' })
      .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja-JP' }))
      .catch(() => YoutubeTranscript.fetchTranscript(videoId));
    // 改行で結合して文章構造を保持（スペース結合だと Phase 2 が誤解析しやすい）
    transcript = segments.map((s) => s.text).join('\n');
    console.log(`[YouTubeClient] transcript fetched: ${transcript.length} chars, ${segments.length} segments`);
  } catch (err) {
    console.log(`[YouTubeClient] transcript unavailable for ${videoId}: ${(err as Error).message}`);
    // 字幕なし動画は説明文にフォールバック
  }

  return {
    videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    transcript,
    thumbnailUrl: thumbnail,
    channelTitle: item.snippet.channelTitle,
    durationSeconds: parseDuration(item.contentDetails.duration),
  };
}
