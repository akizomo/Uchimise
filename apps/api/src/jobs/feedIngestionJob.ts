import { Queue } from 'bullmq';
import type { FeedIngestionJobData } from '../types/feedIngestion';

// 毎週月曜 5:00 JST = 0 20 * * 0 UTC
const CRON_SCHEDULE = '0 20 * * 0';

function isQueueEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL);
}

export const feedIngestionQueue: Queue<FeedIngestionJobData> | null = isQueueEnabled()
  ? new Queue<FeedIngestionJobData>('feedIngestion', {
      connection: {
        host: process.env.UPSTASH_REDIS_REST_URL ?? '',
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    })
  : null;

export async function enqueueFeedIngestion(data: FeedIngestionJobData): Promise<void> {
  if (!feedIngestionQueue) return;

  await feedIngestionQueue.add('ingest', data, {
    jobId: `feedIngestion:${data.triggeredBy}:${Date.now()}`,
  });
}

export async function addFeedIngestionCron(): Promise<void> {
  if (!feedIngestionQueue) return;

  await feedIngestionQueue.upsertJobScheduler(
    'feedIngestion:weekly',
    { pattern: CRON_SCHEDULE },
    {
      name: 'ingest',
      data: { triggeredBy: 'cron' } as FeedIngestionJobData,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    }
  );
}
