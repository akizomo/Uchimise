export type PatternKey = 'A' | 'B' | 'C' | 'D' | 'E';

// Primary pattern tags (exactly one per Pattern A–E)
export const PRIMARY_PATTERN_TAGS: Record<PatternKey, string> = {
  A: '#今日の旬',
  B: '#知らない料理に挑戦',
  C: '#ちゃんと覚えたい',
  D: '#疲れた帰りに',
  E: '#誰かに作る',
};

export interface FixedTagRule {
  tag: string;
  patterns: PatternKey[];
}

// Extra fixed tags that can apply to multiple patterns.
export const FIXED_TAG_RULES: FixedTagRule[] = [
  { tag: '#週末のゆっくり朝ごはん', patterns: ['A', 'E'] },
  { tag: '#お弁当のおかず', patterns: ['D'] },
  { tag: '#スパイスで遊ぶ', patterns: ['B', 'C'] },
];

export function getFixedTagsForPattern(pattern: PatternKey): string[] {
  const tags = [PRIMARY_PATTERN_TAGS[pattern]];
  for (const rule of FIXED_TAG_RULES) {
    if (rule.patterns.includes(pattern)) tags.push(rule.tag);
  }
  return Array.from(new Set(tags));
}

