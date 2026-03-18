/**
 * seed-embeddings.ts
 *
 * Generates OpenAI embeddings for all feed_content rows where the embedding
 * is still the zero vector (i.e. rows seeded by the SQL migration).
 *
 * Usage:
 *   pnpm --filter api seed:embeddings
 *
 * Requires:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY in environment
 */

import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import { generateRecipeEmbedding } from '../src/services/feed/embedRecipe';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: rows, error } = await supabase
    .from('feed_content')
    .select('id, title, tags, creator_name');

  if (error) {
    console.error('Failed to fetch feed_content:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No rows found in feed_content.');
    return;
  }

  console.log(`Generating embeddings for ${rows.length} rows...`);

  for (const row of rows) {
    const tags: string[] = Array.isArray(row.tags) ? (row.tags as string[]) : [];
    const text = [row.title as string, row.creator_name as string, ...tags].join(' ');

    try {
      const embedding = await generateRecipeEmbedding(text, []);

      const { error: updateError } = await supabase
        .from('feed_content')
        .update({ embedding })
        .eq('id', row.id);

      if (updateError) {
        console.error(`Failed to update row ${row.id as string}:`, updateError.message);
      } else {
        console.log(`✓ ${row.id as string} — ${row.title as string}`);
      }
    } catch (err) {
      console.error(`Error generating embedding for row ${row.id as string}:`, err);
    }
  }

  console.log('Done.');
}

run();
