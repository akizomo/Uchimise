CREATE TABLE feed_content (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           text NOT NULL,
  source_url      text NOT NULL,
  source_type     source_type NOT NULL,
  creator_name    text,
  thumbnail_url   text,
  tags            text[] NOT NULL DEFAULT '{}',
  embedding       vector(1536),
  published_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX feed_content_published_at_idx ON feed_content(published_at DESC);
