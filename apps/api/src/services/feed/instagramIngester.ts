import type { InstagramChannelConfig, IngestionResult } from '../../types/feedIngestion';

// Phase 2 以降に実装予定。現時点ではスタブ。
// Instagram Graph API は Business/Creator アカウントの承認が必要なため、
// access token の取得・設定後に本実装を行う。
export async function ingestInstagramChannel(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _channel: InstagramChannelConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accessToken: string
): Promise<IngestionResult> {
  return { inserted: 0, skipped: 0 };
}
