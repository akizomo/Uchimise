-- recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- collection_recipes (via collections join)
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collection_recipes"
  ON collection_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own collection_recipes"
  ON collection_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own collection_recipes"
  ON collection_recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- cooking_records
ALTER TABLE cooking_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cooking_records"
  ON cooking_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cooking_records"
  ON cooking_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- feed_content: publicly readable (editorial content)
ALTER TABLE feed_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed_content"
  ON feed_content FOR SELECT
  USING (true);
