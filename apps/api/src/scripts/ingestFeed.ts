import 'dotenv/config';
import type { FeedChannelsConfig } from '../types/feedIngestion';
import { ingestChannel } from '../services/feed/youtubeIngester';
import { ingestInstagramChannel } from '../services/feed/instagramIngester';
import feedChannels from '../data/feed_channels.json';

const channels = feedChannels as FeedChannelsConfig;

// --channel UCxxxxxxxx フラグを解析
function parseChannelFlag(): string | null {
  const idx = process.argv.indexOf('--channel');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1] ?? null;
  }
  return null;
}

async function main(): Promise<void> {
  const apiKey = process.env.YOUTUBE_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[ingestFeed] YOUTUBE_API_KEY is not set — YouTube ingestion will fail');
  }

  const targetChannelId = parseChannelFlag();
  if (targetChannelId) {
    console.log(`[ingestFeed] Running for channel: ${targetChannelId}`);
  } else {
    console.log('[ingestFeed] Running for all active channels');
  }

  let totalInserted = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  // YouTube チャンネルを処理
  for (const channel of channels.youtube) {
    if (!channel.active) continue;
    if (targetChannelId && channel.channelId !== targetChannelId) continue;

    try {
      const result = await ingestChannel(channel, apiKey);
      totalInserted += result.inserted;
      totalSkipped += result.skipped;
      if (result.error) {
        console.warn(`  [skip] ${channel.handle}: ${result.error}`);
        errors.push(`${channel.handle}: ${result.error}`);
      } else {
        console.log(`  [ok]   ${channel.handle} — inserted=${result.inserted} skipped=${result.skipped}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [err]  ${channel.handle}: ${message}`);
      errors.push(`${channel.handle}: ${message}`);
    }
  }

  // Instagram チャンネルを処理（現時点はスタブ）
  const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN ?? '';
  for (const channel of channels.instagram) {
    if (!channel.active) continue;

    try {
      await ingestInstagramChannel(channel, instagramToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [err]  instagram/${channel.username}: ${message}`);
    }
  }

  console.log('');
  console.log(`[ingestFeed] complete — inserted=${totalInserted} skipped=${totalSkipped} errors=${errors.length}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[ingestFeed] fatal:', err);
  process.exit(1);
});
