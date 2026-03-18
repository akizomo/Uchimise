export interface YouTubeChannelConfig {
  channelId: string | null;
  handle: string;
  name: string;
  pattern: string;
  tags: string[];
  maxResults: number;
  active: boolean;
}

export interface InstagramChannelConfig {
  username: string;
  name: string;
  pattern: string;
  tags: string[];
  active: boolean;
}

export interface FeedChannelsConfig {
  youtube: YouTubeChannelConfig[];
  instagram: InstagramChannelConfig[];
}

export interface IngestionResult {
  inserted: number;
  skipped: number;
  error?: string;
}

export interface FeedIngestionJobData {
  triggeredBy: 'cron' | 'manual';
  channelIds?: string[]; // 指定時は該当チャンネルのみ処理
}
