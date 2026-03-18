-- Add minimal columns for discovery ingestion v1
ALTER TABLE feed_content
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS platform_id text;

-- Backfill canonical_url for existing rows
UPDATE feed_content
SET canonical_url = source_url
WHERE canonical_url IS NULL;

-- Dedupe / upsert support
CREATE UNIQUE INDEX IF NOT EXISTS feed_content_canonical_url_uidx
  ON feed_content(canonical_url)
  WHERE canonical_url IS NOT NULL;

