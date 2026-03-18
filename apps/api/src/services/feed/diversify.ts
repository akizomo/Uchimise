import type { FeedItem } from './vectorSearch';

type PatternKey = 'A' | 'B' | 'C' | 'D' | 'E';

const PRIMARY_PATTERN_TAGS: Record<PatternKey, string> = {
  A: '#今日の旬',
  B: '#知らない料理に挑戦',
  C: '#ちゃんと覚えたい',
  D: '#疲れた帰りに',
  E: '#誰かに作る',
};

function detectPattern(tags: string[]): PatternKey | null {
  for (const [pattern, tag] of Object.entries(PRIMARY_PATTERN_TAGS) as Array<[PatternKey, string]>) {
    if (tags.includes(tag)) return pattern;
  }
  return null;
}

function detectCuisine(tags: string[]): string {
  const cuisine = tags.find((t) => t.endsWith('料理'));
  return cuisine ?? 'other';
}

export interface DiversifyOptions {
  limit: number;
  requirePatternB: boolean;
  mix?: Record<PatternKey, number>;
}

const DEFAULT_MIX: Record<PatternKey, number> = {
  A: 0.2,
  B: 0.2,
  C: 0.15,
  D: 0.3,
  E: 0.15,
};

function normalizeMix(mix: Record<PatternKey, number>): Record<PatternKey, number> {
  const sum = Object.values(mix).reduce((a, b) => a + b, 0);
  if (sum <= 0) return DEFAULT_MIX;
  return {
    A: mix.A / sum,
    B: mix.B / sum,
    C: mix.C / sum,
    D: mix.D / sum,
    E: mix.E / sum,
  };
}

function computeTargets(limit: number, mix: Record<PatternKey, number>): Record<PatternKey, number> {
  const normalized = normalizeMix(mix);
  const floors: Record<PatternKey, number> = {
    A: Math.floor(limit * normalized.A),
    B: Math.floor(limit * normalized.B),
    C: Math.floor(limit * normalized.C),
    D: Math.floor(limit * normalized.D),
    E: Math.floor(limit * normalized.E),
  };

  let remaining = limit - Object.values(floors).reduce((a, b) => a + b, 0);

  const remainders = (Object.keys(floors) as PatternKey[])
    .map((k) => ({
      k,
      r: limit * normalized[k] - floors[k],
    }))
    .sort((a, b) => b.r - a.r);

  for (let i = 0; i < remainders.length && remaining > 0; i += 1) {
    floors[remainders[i]!.k] += 1;
    remaining -= 1;
  }

  return floors;
}

/**
 * Re-rank candidate items with diversity constraints.
 *
 * Rules implemented:
 * - avoid consecutive same creator
 * - avoid 3+ consecutive same cuisine
 * - ensure at least one Pattern B in the page if any exists in candidates
 * - slight bias towards Pattern D (weighting), without forcing perfect balance
 */
export function diversifyFeed(items: FeedItem[], options: DiversifyOptions): FeedItem[] {
  if (items.length <= 1) return items.slice(0, options.limit);

  const buckets: Record<PatternKey | 'unknown', FeedItem[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    unknown: [],
  };

  for (const item of items) {
    const pattern = detectPattern(item.tags) ?? 'unknown';
    buckets[pattern].push(item);
  }

  const target = computeTargets(options.limit, options.mix ?? DEFAULT_MIX);
  // Track how many we have placed for each pattern (ignore unknown)
  const placedCount: Record<PatternKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  const out: FeedItem[] = [];
  let lastCreator = '';
  let lastCuisine = '';
  let cuisineStreak = 0;

  function canPlace(candidate: FeedItem): boolean {
    const creator = candidate.creatorName ?? '';
    if (creator && creator === lastCreator) return false;

    // Only apply cuisine streak check when an explicit cuisine tag is present.
    // Without cuisine tags, detectCuisine returns 'other' for everything, which
    // would trigger the streak after just 2 items and break pattern diversity.
    const cuisine = detectCuisine(candidate.tags);
    if (cuisine !== 'other') {
      const nextStreak = cuisine === lastCuisine ? cuisineStreak + 1 : 1;
      if (nextStreak >= 3) return false;
    }

    return true;
  }

  function place(candidate: FeedItem) {
    out.push(candidate);
    const creator = candidate.creatorName ?? '';
    const cuisine = detectCuisine(candidate.tags);
    const pattern = detectPattern(candidate.tags);
    if (pattern) placedCount[pattern] += 1;

    lastCreator = creator || lastCreator;
    if (cuisine === lastCuisine) {
      cuisineStreak += 1;
    } else {
      lastCuisine = cuisine;
      cuisineStreak = 1;
    }
  }

  function nextPatternOrder(): PatternKey[] {
    // Choose patterns that are still under target, prioritize the largest gap.
    const gaps = (Object.keys(target) as PatternKey[])
      .map((k) => ({
        k,
        gap: target[k] - placedCount[k],
      }))
      .filter((x) => x.gap > 0)
      .sort((a, b) => b.gap - a.gap);

    return gaps.map((g) => g.k);
  }

  // Greedy: pick from the most underfilled pattern first, then fall back.
  while (out.length < options.limit) {
    let placed = false;

    const order = nextPatternOrder();
    for (const key of order) {
      const bucket = buckets[key];
      const idx = bucket.findIndex(canPlace);
      if (idx >= 0) {
        const [candidate] = bucket.splice(idx, 1);
        place(candidate);
        placed = true;
        break;
      }
    }

    if (placed) continue;

    // Fallback: any bucket item that fits constraints.
    const allBuckets = Object.values(buckets).flat();
    const idx = allBuckets.findIndex(canPlace);
    if (idx >= 0) {
      // Remove from its original bucket
      const candidate = allBuckets[idx]!;
      const pattern = detectPattern(candidate.tags) ?? 'unknown';
      const srcBucket = buckets[pattern];
      const srcIdx = srcBucket.findIndex((x) => x.id === candidate.id);
      if (srcIdx >= 0) srcBucket.splice(srcIdx, 1);
      place(candidate);
      continue;
    }

    // Last resort: no candidate satisfies constraints → just append remaining by original order.
    const remaining = items.filter((i) => !out.some((o) => o.id === i.id));
    out.push(...remaining);
    break;
  }

  const trimmed = out.slice(0, options.limit);

  if (options.requirePatternB) {
    const hasB = trimmed.some((i) => detectPattern(i.tags) === 'B');
    if (!hasB) {
      const bCandidate = items.find((i) => detectPattern(i.tags) === 'B');
      if (bCandidate) {
        trimmed[trimmed.length - 1] = bCandidate;
      }
    }
  }

  return trimmed;
}

