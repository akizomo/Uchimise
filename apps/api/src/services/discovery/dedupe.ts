export interface DedupeKeyInput {
  canonicalUrl?: string | null;
  platformId?: string | null;
}

export function buildDedupeKey(input: DedupeKeyInput): string {
  const canonical = (input.canonicalUrl ?? '').trim();
  const platformId = (input.platformId ?? '').trim();

  if (canonical) return `canonical_url:${canonical}`;
  if (platformId) return `platform_id:${platformId}`;

  // Worst-case fallback: caller should avoid this by always providing canonicalUrl.
  return 'unknown';
}

