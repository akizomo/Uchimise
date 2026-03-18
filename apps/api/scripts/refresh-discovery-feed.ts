/**
 * refresh-discovery-feed.ts
 *
 * Manual refresh command for discovery feed ingestion (v1).
 *
 * Usage:
 *   pnpm --filter @uchimise/api refresh:discovery-feed
 *
 * Requires:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   OPENAI_API_KEY (for embeddings)
 */

import 'dotenv/config';

import { refreshDiscoveryFeed } from '../src/services/discovery/refresh';

async function run() {
  const rawArg = process.argv.find((a) => a.startsWith('--mode='));
  const mode = rawArg ? rawArg.replace('--mode=', '') : undefined;

  const result = await refreshDiscoveryFeed({
    mode: mode as never,
  });
  // eslint-disable-next-line no-console
  console.log(`Discovery feed refreshed: ${result.insertedOrUpdated} items`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

