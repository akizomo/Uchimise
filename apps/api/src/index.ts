import 'dotenv/config';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { collectionsRoute } from './routes/collections';
import { cookingRecordsRoute } from './routes/cooking-records';
import { extractRoute } from './routes/extract';
import { feedRoute } from './routes/feed';
import { mealPlansRoute } from './routes/meal-plans';
import { pushTokensRoute } from './routes/push-tokens';
import { recipesRoute } from './routes/recipes';
import type { AppEnv } from './types/hono';

const app = new Hono<AppEnv>();

app.use('*', logger());
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:8081').split(',');
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Health check (no auth required)
app.get('/health', (c) => c.json({ status: 'ok' }));

// Authenticated routes
app.use('/api/*', rateLimitMiddleware);
app.use('/api/*', authMiddleware);

app.route('/api/extract', extractRoute);
app.route('/api/recipes', recipesRoute);
app.route('/api/feed', feedRoute);
app.route('/api/collections', collectionsRoute);
app.route('/api/meal-plans', mealPlansRoute);
app.route('/api/cooking-records', cookingRecordsRoute);
app.route('/api/push-tokens', pushTokensRoute);

export default app;

// Local dev server (tsx watch src/index.ts)
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3000);
  // Bind to all interfaces so real devices on LAN can reach the API.
  const hostname = '0.0.0.0';

  serve({
    fetch: app.fetch,
    port,
    hostname,
  });

  // eslint-disable-next-line no-console
  console.log(`API listening on http://${hostname}:${port}`);
}
