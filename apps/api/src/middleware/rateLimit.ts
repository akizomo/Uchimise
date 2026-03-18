import type { Context, Next } from 'hono';

// Simple in-memory rate limiter — replace with Redis-backed solution for production
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;

export async function rateLimitMiddleware(c: Context, next: Next): Promise<Response | void> {
  const ip = c.req.header('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || record.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    await next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  record.count++;
  await next();
}
