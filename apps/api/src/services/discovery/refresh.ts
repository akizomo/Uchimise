import { createAdminClient } from '../../db/supabaseAdmin';
import { generateRecipeEmbedding } from '../feed/embedRecipe';
import { getFixedTagsForPattern } from './config/patternTags';
import { MANUAL_SEED_ITEMS } from './config/manualSeedItems';
import { SEARCH_KEYWORDS } from './config/searchKeywords';
import { generateAutoTags } from './tagger';
import { fetchYoutubeMeta } from './youtube';
import { searchYoutubeByKeyword } from './youtubeSearch';

type SourceType = 'youtube' | 'instagram';

interface FeedContentUpsert {
  title: string;
  source_url: string;
  source_type: SourceType;
  creator_name: string | null;
  thumbnail_url: string | null;
  tags: string[];
  published_at: string;
  canonical_url: string;
  platform_id: string | null;
  embedding: number[];
}

export interface RefreshDiscoveryFeedResult {
  insertedOrUpdated: number;
}

export type RefreshMode =
  | 'whitelist_youtube'
  | 'whitelist_instagram'
  | 'search_keywords'
  | 'slow_public_sources'
  | 'all';

export interface RefreshDiscoveryFeedOptions {
  mode?: RefreshMode;
}

/**
 * v1: manual seed + lightweight metadata enrichment.
 * - Keeps diversity by requiring Pattern A-E tags on each seed item.
 * - Uses canonical_url for dedupe (unique index expected).
 */
export async function refreshDiscoveryFeed(
  options: RefreshDiscoveryFeedOptions = {}
): Promise<RefreshDiscoveryFeedResult> {
  const supabase = createAdminClient();

  const mode: RefreshMode = options.mode ?? 'all';
  const includeManualSeed =
    mode === 'all' ||
    mode === 'whitelist_youtube' ||
    mode === 'whitelist_instagram' ||
    mode === 'slow_public_sources';
  const includeKeywordSearch = mode === 'all' || mode === 'search_keywords';

  const rows: FeedContentUpsert[] = [];

  if (includeManualSeed) {
    for (const item of MANUAL_SEED_ITEMS) {
      // Mode gate for v1: manual seeds contain mixed platforms; allow filtering
      if (mode === 'whitelist_youtube' && item.platform !== 'youtube') continue;
      if (mode === 'whitelist_instagram' && item.platform !== 'instagram') continue;

      const publishedAt = item.publishedAt ?? new Date().toISOString();
      const fixedTags = getFixedTagsForPattern(item.pattern);

      if (item.platform === 'youtube') {
        const meta = await fetchYoutubeMeta(item.url);
        const title = item.title ?? meta.title;
        const creator = item.creatorName ?? meta.creatorName ?? null;
        const thumbnail = item.thumbnailUrl ?? meta.thumbnailUrl ?? null;

        const autoTags = generateAutoTags({
          title,
          description: null,
          maxTags: 8,
        });

        const tags = Array.from(new Set([...fixedTags, ...autoTags]));
        const embedding = await generateRecipeEmbedding(title, tags);

        rows.push({
          title,
          source_url: meta.canonicalUrl,
          source_type: 'youtube',
          creator_name: creator,
          thumbnail_url: thumbnail,
          tags,
          published_at: publishedAt,
          canonical_url: meta.canonicalUrl,
          platform_id: meta.platformId,
          embedding,
        });
        continue;
      }

      // instagram / others: url-only fallback
      const title = item.title ?? item.url;
      const creator = item.creatorName ?? null;
      const thumbnail = item.thumbnailUrl ?? null;
      const autoTags = generateAutoTags({ title, description: null, maxTags: 8 });
      const tags = Array.from(new Set([...fixedTags, ...autoTags]));
      const embedding = await generateRecipeEmbedding(title, tags);

      rows.push({
        title,
        source_url: item.url,
        source_type: 'instagram',
        creator_name: creator,
        thumbnail_url: thumbnail,
        tags,
        published_at: publishedAt,
        canonical_url: item.url,
        platform_id: null,
        embedding,
      });
    }
  }

  // keyword_search (YouTube only for v1)
  // Recrawl rule: only look back 30 days for new videos.
  if (includeKeywordSearch) {
    const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const seenCanonical = new Set(rows.map((r) => r.canonical_url));

    const patterns = Object.keys(SEARCH_KEYWORDS) as Array<keyof typeof SEARCH_KEYWORDS>;
    for (const pattern of patterns) {
      for (const query of SEARCH_KEYWORDS[pattern]) {
        const results = await searchYoutubeByKeyword({
          pattern,
          query,
          maxResults: 3,
          publishedAfter,
        });

        for (const r of results) {
          if (seenCanonical.has(r.canonicalUrl)) continue;

          const fixedTags = getFixedTagsForPattern(pattern);
          const autoTags = generateAutoTags({
            title: r.title,
            description: null,
            maxTags: 8,
          });
          const tags = Array.from(new Set([...fixedTags, ...autoTags]));
          const embedding = await generateRecipeEmbedding(r.title, tags);

          rows.push({
            title: r.title,
            source_url: r.canonicalUrl,
            source_type: 'youtube',
            creator_name: r.creatorName,
            thumbnail_url: r.thumbnailUrl,
            tags,
            published_at: r.publishedAt ?? new Date().toISOString(),
            canonical_url: r.canonicalUrl,
            platform_id: r.platformId,
            embedding,
          });

          seenCanonical.add(r.canonicalUrl);
        }
      }
    }
  }

  // Upsert by canonical_url (requires unique constraint/index in DB)
  const { error } = await supabase
    .from('feed_content')
    .upsert(rows, { onConflict: 'canonical_url' });

  if (error) {
    throw new Error(`Failed to upsert feed_content: ${error.message}`);
  }

  return { insertedOrUpdated: rows.length };
}

