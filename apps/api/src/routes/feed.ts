import { Hono } from 'hono';
import type { AppEnv } from '../types/hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { searchFeed, mapRow } from '../services/feed/vectorSearch';
import { createAdminClient } from '../db/supabaseAdmin';
import { diversifyFeed } from '../services/feed/diversify';

const feedRoute = new Hono<AppEnv>();

const feedQuerySchema = z.object({
  tags: z.string().optional(), // comma-separated
  cursor: z.string().optional(),
  limit: z.string().optional(),
  debug: z.string().optional(),
});

feedRoute.get('/', zValidator('query', feedQuerySchema), async (c) => {
  const userId = c.get('userId') as string;
  const query = c.req.valid('query');

  const tags = query.tags ? query.tags.split(',').map((t) => t.trim()) : undefined;
  const limit = query.limit ? Math.min(parseInt(query.limit, 10), 50) : 20;
  const debug = query.debug === '1';

  try {
    const candidates = await searchFeed({
      userId,
      tags,
      // Pull more candidates so we can apply diversity constraints safely.
      limit: Math.min(limit * 3, 50),
      cursor: query.cursor,
    });

    const items = diversifyFeed(candidates, {
      limit,
      requirePatternB: true,
      mix: { A: 0.2, B: 0.2, C: 0.15, D: 0.3, E: 0.15 },
    });
    const nextCursor = items.length === limit ? items[items.length - 1]?.publishedAt : null;

    return c.json({
      success: true,
      data: items,
      pagination: { nextCursor },
      ...(debug
        ? {
            debug: {
              tagFilter: tags ?? null,
              candidateCount: candidates.length,
              returnedCount: items.length,
              firstCandidateTags: candidates[0]?.tags ?? null,
            },
          }
        : {}),
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch feed' }, 500);
  }
});

feedRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('feed_content')
    .select('id, title, source_url, source_type, creator_name, thumbnail_url, tags, published_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'not_found' }, 404);
  }

  return c.json({ success: true, data: mapRow(data as Record<string, unknown>) });
});

export { feedRoute };
