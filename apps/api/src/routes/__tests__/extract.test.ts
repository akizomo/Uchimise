import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock modules before importing app
jest.mock('../../db/supabaseAdmin', () => ({
  createAdminClient: jest.fn(),
}));

jest.mock('../../jobs/queue', () => ({
  // @ts-expect-error: jest.fn() mock chain has overly-strict type inference in @jest/globals
  enqueuePhase2: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/phase1/youtubeClient', () => ({
  fetchYouTubeVideo: jest.fn(),
  YouTubeQuotaExceededError: class YouTubeQuotaExceededError extends Error {
    constructor() {
      super('quota exceeded');
      this.name = 'YouTubeQuotaExceededError';
    }
  },
}));

jest.mock('../../services/phase1/instagramClient', () => ({
  fetchInstagramMedia: jest.fn(),
  InstagramPrivatePostError: class InstagramPrivatePostError extends Error {
    constructor() {
      super('private');
      this.name = 'InstagramPrivatePostError';
    }
  },
}));

jest.mock('../../middleware/auth', () => ({
  authMiddleware: async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: string) => void }).set('userId', 'test-user-id');
    await next();
  },
}));

describe('POST /api/extract', () => {
  it('returns 400 for invalid URL', async () => {
    const { default: app } = await import('../../index');
    const res = await app.request('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ url: 'not-a-url' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns already_saved when URL exists', async () => {
    const { createAdminClient } = await import('../../db/supabaseAdmin') as {
      createAdminClient: jest.MockedFunction<() => unknown>
    };
    (createAdminClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        // @ts-expect-error: jest.fn() mock chain has overly-strict type inference in @jest/globals
        single: jest.fn().mockResolvedValue({ data: { id: 'existing-id' }, error: null }),
        insert: jest.fn().mockReturnThis(),
      })),
    });

    const { default: app } = await import('../../index');
    const res = await app.request('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { code: string };
    expect(body.code).toBe('already_saved');
  });
});
