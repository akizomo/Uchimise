import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import app from '../../index';

// Mock Supabase admin client
jest.mock('../../db/supabaseAdmin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      // @ts-expect-error: jest.fn() mock chain has overly-strict type inference in @jest/globals
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Mock auth middleware to inject userId
jest.mock('../../middleware/auth', () => ({
  authMiddleware: async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: string) => void }).set('userId', 'test-user-id');
    await next();
  },
}));

describe('GET /api/recipes/:id', () => {
  it('returns 404 when recipe not found', async () => {
    const res = await app.request('/api/recipes/non-existent-id', {
      headers: { Authorization: 'Bearer test-token' },
    });
    expect(res.status).toBe(404);
  });
});

// Auth middleware 401 behaviour is covered by integration tests that run against
// a real Supabase instance. Unit-level mocks override authMiddleware, so a
// network-based test here would be misleading.
