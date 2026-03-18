import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '../db/supabaseAdmin';
import type { AppEnv } from '../types/hono';

const pushTokensRoute = new Hono<AppEnv>();

const registerSchema = z.object({
  token: z.string().min(1),
});

// POST /api/push-tokens — register or refresh an Expo push token for the authenticated user
pushTokensRoute.post('/', zValidator('json', registerSchema), async (c) => {
  const userId = c.get('userId');
  const { token } = c.req.valid('json');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' },
    );

  if (error) {
    return c.json({ success: false, error: 'db_error' }, 500);
  }

  return c.json({ success: true });
});

// DELETE /api/push-tokens — unregister a token (on sign-out)
pushTokensRoute.delete('/', zValidator('json', registerSchema), async (c) => {
  const userId = c.get('userId');
  const { token } = c.req.valid('json');

  const supabase = createAdminClient();

  await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token);

  return c.json({ success: true });
});

export { pushTokensRoute };
