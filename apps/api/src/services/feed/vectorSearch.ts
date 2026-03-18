import { createAdminClient } from '../../db/supabaseAdmin';
import { generateRecipeEmbedding } from './embedRecipe';

export interface FeedItem {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: 'youtube' | 'instagram';
  creatorName: string;
  thumbnailUrl: string;
  tags: string[];
  publishedAt: string;
  similarityScore?: number;
}

export interface SearchFeedOptions {
  userId: string;
  tags?: string[];
  limit?: number;
  cursor?: string; // published_at ISO string for cursor pagination
}

/** Build a preference vector from the user's most recently saved recipes. */
async function buildUserPreferenceEmbedding(
  userId: string
): Promise<number[] | null> {
  const supabase = createAdminClient();

  const { data: recentRecipes } = await supabase
    .from('recipes')
    .select('title, tags')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentRecipes || recentRecipes.length === 0) return null;

  // Concatenate all titles + tags into one preference description
  const preferenceText = recentRecipes
    .map((r) => {
      const tags = Array.isArray(r.tags) ? (r.tags as string[]) : [];
      return [r.title as string, ...tags].join(' ');
    })
    .join(' ');

  return generateRecipeEmbedding(preferenceText, []);
}

/** Map a raw DB row to the FeedItem shape. */
export function mapRow(row: Record<string, unknown>): FeedItem {
  return {
    id: row.id as string,
    title: row.title as string,
    sourceUrl: row.source_url as string,
    sourceType: row.source_type as 'youtube' | 'instagram',
    creatorName: (row.creator_name as string) ?? '',
    thumbnailUrl: (row.thumbnail_url as string) ?? '',
    tags: (row.tags as string[]) ?? [],
    publishedAt: row.published_at as string,
  };
}

export async function searchFeed(options: SearchFeedOptions): Promise<FeedItem[]> {
  const { userId, tags, limit = 20, cursor } = options;
  const supabase = createAdminClient();

  // Check how many saved recipes the user has
  const { count: savedCount } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const useVectorSearch = (savedCount ?? 0) >= 3;

  // --- pgvector similarity path ---
  if (useVectorSearch) {
    const queryEmbedding = await buildUserPreferenceEmbedding(userId);

    // If embedding generation failed (e.g. OPENAI_API_KEY not set → zero vector),
    // fall through to the chronological path rather than returning biased results
    const isZeroVector =
      queryEmbedding !== null && queryEmbedding.every((v) => v === 0);

    if (queryEmbedding !== null && !isZeroVector) {
      const { data, error } = await supabase.rpc('search_feed_by_embedding', {
        query_embedding: queryEmbedding,
        tag_filter: tags && tags.length > 0 ? tags : null,
        cursor_time: cursor ?? null,
        result_limit: limit,
      });

      if (!error && data) {
        return (data as Record<string, unknown>[]).map(mapRow);
      }
      // On RPC error, fall through to chronological
    }
  }

  // --- chronological fallback (cold start or missing embedding) ---
  let query = supabase
    .from('feed_content')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  if (cursor) {
    query = query.lt('published_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Feed query failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}
