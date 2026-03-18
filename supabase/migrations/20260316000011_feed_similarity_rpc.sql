-- RPC function for pgvector cosine similarity feed search
-- Called from vectorSearch.ts when user has ≥3 saved recipes
CREATE OR REPLACE FUNCTION search_feed_by_embedding(
  query_embedding vector(1536),
  tag_filter      text[],
  cursor_time     timestamptz,
  result_limit    int
)
RETURNS SETOF feed_content
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM feed_content
  WHERE
    -- Tag filter: skip if no tags provided
    (array_length(tag_filter, 1) IS NULL OR tags && tag_filter)
    -- Cursor pagination: published before the cursor
    AND (cursor_time IS NULL OR published_at < cursor_time)
    -- Only search items that have an embedding (seed data may have nulls)
    AND embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT result_limit;
$$;
