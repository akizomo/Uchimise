-- ============================================================
-- Uchimise — All Migrations (実行順)
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください
-- ============================================================

-- ------------------------------------------------------------
-- 20260316000001_create_recipes.sql
-- ------------------------------------------------------------
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE recipe_phase AS ENUM ('phase1', 'phase2', 'manual');
CREATE TYPE extraction_status AS ENUM ('pending', 'done', 'failed');
CREATE TYPE source_type AS ENUM ('youtube', 'instagram');

CREATE TABLE recipes (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               text NOT NULL,
  source_url          text NOT NULL,
  source_type         source_type NOT NULL,
  creator_name        text,
  thumbnail_url       text,
  cook_time_minutes   int,
  phase               recipe_phase NOT NULL DEFAULT 'phase1',
  extraction_status   extraction_status NOT NULL DEFAULT 'pending',
  ingredients         jsonb NOT NULL DEFAULT '[]',
  steps               jsonb NOT NULL DEFAULT '[]',
  tags                text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recipes_user_id_idx ON recipes(user_id);
CREATE INDEX recipes_source_url_idx ON recipes(source_url);


-- ------------------------------------------------------------
-- 20260316000002_create_collections.sql
-- ------------------------------------------------------------
CREATE TABLE collections (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  is_auto     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX collections_user_id_idx ON collections(user_id);


-- ------------------------------------------------------------
-- 20260316000003_create_collection_recipes.sql
-- ------------------------------------------------------------
CREATE TABLE collection_recipes (
  collection_id   uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id       uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position        int NOT NULL DEFAULT 0,
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, recipe_id)
);

CREATE INDEX collection_recipes_collection_id_idx ON collection_recipes(collection_id);


-- ------------------------------------------------------------
-- 20260316000004_create_cooking_records.sql
-- ------------------------------------------------------------
CREATE TABLE cooking_records (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id   uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at   timestamptz NOT NULL DEFAULT now(),
  note        text
);

CREATE INDEX cooking_records_user_id_idx ON cooking_records(user_id);


-- ------------------------------------------------------------
-- 20260316000005_enable_pgvector.sql
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;


-- ------------------------------------------------------------
-- 20260316000006_create_feed_content.sql
-- ------------------------------------------------------------
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


-- ------------------------------------------------------------
-- 20260316000007_enable_rls.sql
-- ------------------------------------------------------------
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


-- ------------------------------------------------------------
-- 20260316000008_feed_content_index.sql
-- ------------------------------------------------------------
-- IVFFlat index for cosine similarity search on embeddings
CREATE INDEX feed_content_embedding_idx
  ON feed_content
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);


-- ------------------------------------------------------------
-- 20260316000009_seed_feed_content.sql
-- ------------------------------------------------------------
-- Editorial seed data (25 items) for cold-start feed
-- Pattern A-E × 気分タグ対応 — discovery_feed_sources.md 準拠
INSERT INTO feed_content (title, source_url, source_type, creator_name, thumbnail_url, tags, published_at) VALUES
-- Pattern A: 旬と素材の物語
('たけのこご飯の作り方・春の炊き込みご飯', 'https://www.youtube.com/watch?v=AKJtVpQnR3w', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg', ARRAY['今日作れそう', '週末向け'], now() - interval '1 day'),
('春キャベツとベーコンのスープ・一汁一菜の朝ごはん', 'https://www.youtube.com/watch?v=BLm8eRqWX5s', 'youtube', '有賀薫', 'https://img.youtube.com/vi/BLm8eRqWX5s/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー'], now() - interval '2 days'),
('アジの捌き方と南蛮漬け・旬の魚を丸ごと使う', 'https://www.youtube.com/watch?v=CP9nFsWv74m', 'youtube', 'ひろさんキッチン', 'https://img.youtube.com/vi/CP9nFsWv74m/hqdefault.jpg', ARRAY['週末向け', 'ヘルシー'], now() - interval '3 days'),
('菜の花の辛子和え・春野菜の副菜レシピ', 'https://www.youtube.com/watch?v=DQ7gHxUk82n', 'youtube', 'NHKきょうの料理 公式', 'https://img.youtube.com/vi/DQ7gHxUk82n/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー'], now() - interval '4 days'),
('ふきのとう味噌の作り方・春の保存食', 'https://www.youtube.com/watch?v=EH2kMzVj91o', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/EH2kMzVj91o/hqdefault.jpg', ARRAY['作り置き', '週末向け'], now() - interval '5 days'),
-- Pattern B: 隣国・隣文化の食卓
('本格ビビンバ・韓国家庭料理の作り方', 'https://www.youtube.com/watch?v=FJ3nNwYk05p', 'youtube', 'Koh Kentetsu Kitchen', 'https://img.youtube.com/vi/FJ3nNwYk05p/hqdefault.jpg', ARRAY['週末向け', '今日作れそう'], now() - interval '6 days'),
('3種のスパイスで作るチキンカレー・スパイス入門', 'https://www.youtube.com/watch?v=GK4oQxL16q', 'youtube', '印度カリー子', 'https://img.youtube.com/vi/GK4oQxL16q/hqdefault.jpg', ARRAY['今日作れそう', '週末向け'], now() - interval '7 days'),
('スペイン風トルティーヤ・卵とじゃがいものオムレツ', 'https://www.youtube.com/watch?v=HL5pRyM27r', 'youtube', 'ワタナベマキ', 'https://img.youtube.com/vi/HL5pRyM27r/hqdefault.jpg', ARRAY['週末向け', '今日作れそう'], now() - interval '8 days'),
('台湾風魯肉飯（ルーローハン）・日本の材料で作る', 'https://www.youtube.com/watch?v=IM6qSzN38s', 'youtube', '我が家の台湾料理 Yuuka Chen', 'https://img.youtube.com/vi/IM6qSzN38s/hqdefault.jpg', ARRAY['週末向け', '作り置き'], now() - interval '9 days'),
('ひよこ豆のサブジ・インドの副菜レシピ', 'https://www.youtube.com/watch?v=JN7rTwO49t', 'youtube', '印度カリー子', 'https://img.youtube.com/vi/JN7rTwO49t/hqdefault.jpg', ARRAY['ヘルシー', '時短'], now() - interval '10 days'),
('韓国の春雨炒め チャプチェ・本場の味', 'https://www.youtube.com/watch?v=KO8sUxP50u', 'youtube', 'Koh Kentetsu Kitchen', 'https://img.youtube.com/vi/KO8sUxP50u/hqdefault.jpg', ARRAY['今日作れそう', '週末向け'], now() - interval '11 days'),
-- Pattern C: 技術と知識の一段深み
('鶏むね肉を柔らかく仕上げる下処理・プロの技法', 'https://www.youtube.com/watch?v=LP9tVyQ61v', 'youtube', 'COCOCOROチャンネル', 'https://img.youtube.com/vi/LP9tVyQ61v/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー'], now() - interval '12 days'),
('一番だしの引き方・かつおと昆布の合わせだし', 'https://www.youtube.com/watch?v=MQ0wZzR72w', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/MQ0wZzR72w/hqdefault.jpg', ARRAY['週末向け', 'ヘルシー'], now() - interval '13 days'),
('自家製味噌の仕込み方・大豆から作る発酵食品', 'https://www.youtube.com/watch?v=NR1xAaS83x', 'youtube', 'マルカワみそ公式', 'https://img.youtube.com/vi/NR1xAaS83x/hqdefault.jpg', ARRAY['作り置き', '週末向け'], now() - interval '14 days'),
('ブレゼで仕上げる豚バラ角煮・火入れの科学', 'https://www.youtube.com/watch?v=OS2yBbT94y', 'youtube', 'COCOCOROチャンネル', 'https://img.youtube.com/vi/OS2yBbT94y/hqdefault.jpg', ARRAY['週末向け'], now() - interval '15 days'),
-- Pattern D: 平日の現実に寄り添う再現性
('至高の豚バラ大根・15分で作る本格煮物', 'https://www.youtube.com/watch?v=PT3zCcU05z', 'youtube', '料理研究家リュウジのバズレシピ', 'https://img.youtube.com/vi/PT3zCcU05z/hqdefault.jpg', ARRAY['時短', '今日作れそう'], now() - interval '16 days'),
('前日の残り物で作るバランス弁当・3品10分', 'https://www.youtube.com/watch?v=QU4aDdV16A', 'youtube', 'にぎりっ娘。', 'https://img.youtube.com/vi/QU4aDdV16A/hqdefault.jpg', ARRAY['時短', '作り置き'], now() - interval '17 days'),
('帰ってすぐ作れる一汁三菜・平日30分レシピ', 'https://www.instagram.com/p/C8mP3rAtW7v/', 'instagram', 'mariko', '', ARRAY['時短', '今日作れそう', 'ヘルシー'], now() - interval '18 days'),
('疲れた夜でも15分で完成する豚こま炒め', 'https://www.instagram.com/p/D9nQ4sBuX8w/', 'instagram', 'まみ', '', ARRAY['時短', '今日作れそう'], now() - interval '19 days'),
('悪魔のおにぎり・止まらない旨さのコンビニ超え', 'https://www.youtube.com/watch?v=RV5bEeW27B', 'youtube', '料理研究家リュウジのバズレシピ', 'https://img.youtube.com/vi/RV5bEeW27B/hqdefault.jpg', ARRAY['時短', '今日作れそう'], now() - interval '20 days'),
('1週間3500円の節約献立・まとめ買いで乗り切る', 'https://www.instagram.com/p/E0oR5tCvY9x/', 'instagram', 'りなてぃ', '', ARRAY['作り置き', '週末向け'], now() - interval '21 days'),
-- Pattern E: ちょっと特別な日の一品
('週末の贅沢フレンチトースト・バニラクリームがけ', 'https://www.youtube.com/watch?v=SW6cFfX38C', 'youtube', 'はるあん', 'https://img.youtube.com/vi/SW6cFfX38C/hqdefault.jpg', ARRAY['週末向け'], now() - interval '22 days'),
('おもてなしアペリティフプレート・彩りの前菜', 'https://www.instagram.com/p/F1pS6uDwZ0y/', 'instagram', 'Tastemade Japan', '', ARRAY['週末向け'], now() - interval '23 days'),
('地中海風前菜プレート・スペイン惣菜の盛り合わせ', 'https://www.youtube.com/watch?v=TX7dGgY49D', 'youtube', 'ワタナベマキ', 'https://img.youtube.com/vi/TX7dGgY49D/hqdefault.jpg', ARRAY['週末向け'], now() - interval '24 days'),
-- 大使館系
('チュニジア家庭料理「クスクス」・大使館シェフが教える本場の味', 'https://www.youtube.com/watch?v=UY8eHhZ50E', 'youtube', '大使館シェフのおいしいレシピ', 'https://img.youtube.com/vi/UY8eHhZ50E/hqdefault.jpg', ARRAY['週末向け', '今日作れそう'], now() - interval '25 days');


-- ------------------------------------------------------------
-- 20260316000010_create_meal_plans.sql
-- ------------------------------------------------------------
CREATE TYPE meal_slot AS ENUM ('breakfast', 'lunch', 'dinner');

CREATE TABLE meal_plans (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id     uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  planned_date  date NOT NULL,
  meal_slot     meal_slot NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, planned_date, meal_slot)
);

CREATE INDEX meal_plans_user_id_date_idx ON meal_plans(user_id, planned_date);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal_plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal_plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 20260316000011_feed_similarity_rpc.sql
-- ------------------------------------------------------------
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


-- ------------------------------------------------------------
-- 20260316000012_create_push_tokens.sql
-- ------------------------------------------------------------
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


