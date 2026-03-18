import { Worker } from 'bullmq';
import type { FeedIngestionJobData } from '../types/feedIngestion';
import type { FeedChannelsConfig } from '../types/feedIngestion';
import { ingestChannel } from '../services/feed/youtubeIngester';
import { ingestInstagramChannel } from '../services/feed/instagramIngester';
import feedChannels from '../data/feed_channels.json';

const channels = feedChannels as FeedChannelsConfig;

export function startFeedIngestionWorker(): Worker<FeedIngestionJobData> {
  const worker = new Worker<FeedIngestionJobData>(
    'feedIngestion',
    async (job) => {
      const { channelIds } = job.data;
      const apiKey = process.env.YOUTUBE_API_KEY ?? '';

      if (!apiKey) {
        console.warn('[feedIngestion] YOUTUBE_API_KEY is not set — skipping YouTube ingestion');
      }

      let totalInserted = 0;
      let totalSkipped = 0;
      const errors: string[] = [];

      // YouTube チャンネルを処理
      for (const channel of channels.youtube) {
        if (!channel.active) continue;
        if (channelIds && channelIds.length > 0 && channel.channelId !== null && !channelIds.includes(channel.channelId)) continue;

        try {
          const result = await ingestChannel(channel, apiKey);
          totalInserted += result.inserted;
          totalSkipped += result.skipped;
          if (result.error) {
            console.warn(`[feedIngestion] channel=${channel.handle} error: ${result.error}`);
            errors.push(`${channel.handle}: ${result.error}`);
          } else {
            console.log(`[feedIngestion] channel=${channel.handle} inserted=${result.inserted} skipped=${result.skipped}`);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[feedIngestion] channel=${channel.handle} unexpected error: ${message}`);
          errors.push(`${channel.handle}: ${message}`);
        }
      }

      // Instagram チャンネルを処理（現時点はスタブ）
      const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN ?? '';
      for (const channel of channels.instagram) {
        if (!channel.active) continue;
        if (channelIds && channelIds.length > 0 && !channelIds.includes(channel.username)) continue;

        try {
          const result = await ingestInstagramChannel(channel, instagramToken);
          totalInserted += result.inserted;
          totalSkipped += result.skipped;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[feedIngestion] instagram=${channel.username} unexpected error: ${message}`);
          errors.push(`instagram/${channel.username}: ${message}`);
        }
      }

      console.log(
        `[feedIngestion] done — inserted=${totalInserted} skipped=${totalSkipped} errors=${errors.length}`
      );
    },
    {
      connection: {
        host: process.env.UPSTASH_REDIS_REST_URL ?? '',
      },
      concurrency: 1,
    }
  );

  worker.on('failed', (_job, error: Error) => {
    console.error(`[feedIngestion] job failed: ${error.message}`);
  });

  return worker;
}
