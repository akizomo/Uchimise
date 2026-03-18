-- IVFFlat index for cosine similarity search on embeddings
CREATE INDEX feed_content_embedding_idx
  ON feed_content
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
