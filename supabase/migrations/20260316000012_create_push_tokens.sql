-- push_tokens: stores Expo push tokens per user device
CREATE TABLE IF NOT EXISTS push_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own tokens
CREATE POLICY "push_tokens_owner" ON push_tokens
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for fast per-user look-ups by the phase2 worker
CREATE INDEX IF NOT EXISTS push_tokens_user_id_idx ON push_tokens (user_id);
