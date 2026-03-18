import { AUTO_TAG_DICTIONARY, entriesByCategory } from './config/tagDictionary';

export interface TaggerInput {
  title: string;
  description?: string | null;
  maxTags: number;
}

export function generateAutoTags({ title, description, maxTags }: TaggerInput): string[] {
  const text = [title, description ?? ''].join('\n').toLowerCase();

  const tags: string[] = [];
  const seen = new Set<string>();

  // Deterministic order by category to keep diversity stable:
  // cuisine -> ingredients -> methods -> utility
  for (const entry of entriesByCategory(AUTO_TAG_DICTIONARY)) {
    if (tags.length >= maxTags) break;
    if (seen.has(entry.tag)) continue;
    if (!entry.keyword.trim()) continue;
    if (text.includes(entry.keyword.toLowerCase())) {
      tags.push(entry.tag);
      seen.add(entry.tag);
    }
  }

  return tags;
}

