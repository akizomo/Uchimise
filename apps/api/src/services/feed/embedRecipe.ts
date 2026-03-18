import OpenAI from 'openai';

// text-embedding-3-small outputs 1536 dimensions — matches pgvector column definition
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export class EmbeddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

/**
 * Generate a 1536-dim embedding vector for a recipe.
 * Input: title + space-joined tags (kept short to stay well within token limits).
 * Returns a zero vector when OPENAI_API_KEY is not configured (dev/test mode).
 */
export async function generateRecipeEmbedding(
  title: string,
  tags: string[]
): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Graceful degradation: zero vector disables pgvector similarity but does not crash
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  const client = new OpenAI({ apiKey });

  // Compose a short semantic description — no user-controlled content injected here
  const input = [title, ...tags].join(' ').slice(0, 512);

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new EmbeddingError(
      `Unexpected embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${embedding?.length ?? 0}`
    );
  }

  return embedding;
}
