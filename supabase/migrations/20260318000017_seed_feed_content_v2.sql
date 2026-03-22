-- ⚠️ DEV / STAGING ONLY — DO NOT APPLY TO PRODUCTION
-- 新タグ体系（CLAUDE.md 仕様）に合わせたプレースホルダーシードデータ。
-- 本番DBへの適用は禁止。代わりに `pnpm ingest:feed` で実動画を投入すること。
--
-- タグ体系は apps/api/src/data/feed_channels.json と一致させること。

INSERT INTO feed_content (title, source_url, source_type, creator_name, thumbnail_url, tags, published_at, canonical_url, platform_id, embedding)
VALUES

-- ── Pattern A: 今が旬 ─────────────────────────────────────────────────────────
(
  'たけのこご飯の作り方・春の炊き込みご飯',
  'https://www.youtube.com/watch?v=AKJtVpQnR3w',
  'youtube', '白ごはん.com',
  'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg',
  ARRAY['今日作れそう', 'ヘルシー', '今が旬', 'さっぱりと'],
  NOW() - INTERVAL '1 day',
  'https://www.youtube.com/watch?v=AKJtVpQnR3w', 'AKJtVpQnR3w',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  '春キャベツとベーコンのスープ',
  'https://www.youtube.com/watch?v=BLm8eRqWX5s',
  'youtube', '有賀薫',
  'https://img.youtube.com/vi/BLm8eRqWX5s/hqdefault.jpg',
  ARRAY['今日作れそう', 'ヘルシー', '今が旬', 'さっぱりと'],
  NOW() - INTERVAL '2 days',
  'https://www.youtube.com/watch?v=BLm8eRqWX5s', 'BLm8eRqWX5s',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  'アジの南蛮漬け・旬の魚を丸ごと使う',
  'https://www.youtube.com/watch?v=CP9nFsWv74m',
  'youtube', 'ひろさんキッチン',
  'https://img.youtube.com/vi/CP9nFsWv74m/hqdefault.jpg',
  ARRAY['週末向け', 'ヘルシー', '今が旬', '週末の昼に', 'さっぱりと'],
  NOW() - INTERVAL '3 days',
  'https://www.youtube.com/watch?v=CP9nFsWv74m', 'CP9nFsWv74m',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),

-- ── Pattern B: 未知の国の料理 / 初めての食材 ─────────────────────────────────
(
  '本格インドカレーをスパイスから作る',
  'https://www.youtube.com/watch?v=FJ3nNwYk05p',
  'youtube', '印度カリー子',
  'https://img.youtube.com/vi/FJ3nNwYk05p/hqdefault.jpg',
  ARRAY['スパイスの旅', '週末向け', '未知の国の料理', '初めての食材', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '4 days',
  'https://www.youtube.com/watch?v=FJ3nNwYk05p', 'FJ3nNwYk05p',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  '台湾風牛肉麺の作り方',
  'https://www.youtube.com/watch?v=GK4oQxL16q',
  'youtube', '我が家の台湾料理 Yuuka Chen',
  'https://img.youtube.com/vi/GK4oQxL16q/hqdefault.jpg',
  ARRAY['台湾家庭料理', '週末向け', '未知の国の料理', '初めての食材', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '5 days',
  'https://www.youtube.com/watch?v=GK4oQxL16q', 'GK4oQxL16q',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  'モロッコ風タジン鍋の作り方',
  'https://www.youtube.com/watch?v=HL5pRyM27r',
  'youtube', '大使館シェフのおいしいレシピ',
  'https://img.youtube.com/vi/HL5pRyM27r/hqdefault.jpg',
  ARRAY['中東の食卓', '週末向け', '未知の国の料理', '初めての食材', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '6 days',
  'https://www.youtube.com/watch?v=HL5pRyM27r', 'HL5pRyM27r',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),

-- ── Pattern C: 作ったことのない調理法 ────────────────────────────────────────
(
  '発酵調味料の作り方・塩麹を手作りする',
  'https://www.youtube.com/watch?v=LP9tVyQ61v',
  'youtube', 'マルカワみそ公式',
  'https://img.youtube.com/vi/LP9tVyQ61v/hqdefault.jpg',
  ARRAY['作り置き', '週末向け', '作ったことのない調理法', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '7 days',
  'https://www.youtube.com/watch?v=LP9tVyQ61v', 'LP9tVyQ61v',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  'フレンチテクニックで作る煮込み料理',
  'https://www.youtube.com/watch?v=MQ0wZzR72w',
  'youtube', 'COCOCOROチャンネル',
  'https://img.youtube.com/vi/MQ0wZzR72w/hqdefault.jpg',
  ARRAY['週末向け', 'ヘルシー', '作ったことのない調理法', 'ちょっと特別に', '週末の昼に', 'さっぱりと'],
  NOW() - INTERVAL '8 days',
  'https://www.youtube.com/watch?v=MQ0wZzR72w', 'MQ0wZzR72w',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),

-- ── Pattern D: 手軽に済ませたい ──────────────────────────────────────────────
(
  '10分で作れる最強チャーハン',
  'https://www.youtube.com/watch?v=PT3zCcU05z',
  'youtube', '料理研究家リュウジのバズレシピ',
  'https://img.youtube.com/vi/PT3zCcU05z/hqdefault.jpg',
  ARRAY['時短', '今日作れそう', 'おつまみ', '手軽に済ませたい', 'しっかり食べたい'],
  NOW() - INTERVAL '9 days',
  'https://www.youtube.com/watch?v=PT3zCcU05z', 'PT3zCcU05z',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  '作り置きおかず5品・週末まとめ調理',
  'https://www.youtube.com/watch?v=QU4aDdV16A',
  'youtube', 'にぎりっ娘。',
  'https://img.youtube.com/vi/QU4aDdV16A/hqdefault.jpg',
  ARRAY['作り置き', '時短', '手軽に済ませたい'],
  NOW() - INTERVAL '10 days',
  'https://www.youtube.com/watch?v=QU4aDdV16A', 'QU4aDdV16A',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  '疲れた日の15分パスタ',
  'https://www.instagram.com/p/C8mP3rAtW7v/',
  'instagram', 'mariko',
  null,
  ARRAY['時短', '今日作れそう', 'ヘルシー', '手軽に済ませたい', 'さっぱりと'],
  NOW() - INTERVAL '11 days',
  'https://www.instagram.com/p/C8mP3rAtW7v/', 'C8mP3rAtW7v',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),

-- ── Pattern E: 誰かに作りたい ────────────────────────────────────────────────
(
  '友達を呼んだときのおもてなし料理',
  'https://www.youtube.com/watch?v=SW6cFfX38C',
  'youtube', 'はるあん',
  'https://img.youtube.com/vi/SW6cFfX38C/hqdefault.jpg',
  ARRAY['週末向け', 'スイーツ', '誰かに作りたい', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '12 days',
  'https://www.youtube.com/watch?v=SW6cFfX38C', 'SW6cFfX38C',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  'ヨーロッパの家庭料理でおもてなし',
  'https://www.youtube.com/watch?v=TX7dGgY49D',
  'youtube', 'ワタナベマキ',
  'https://img.youtube.com/vi/TX7dGgY49D/hqdefault.jpg',
  ARRAY['週末向け', 'ヨーロッパ家庭料理', '誰かに作りたい', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '13 days',
  'https://www.youtube.com/watch?v=TX7dGgY49D', 'TX7dGgY49D',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
),
(
  '特別な日のデザートプレート',
  'https://www.instagram.com/p/F1pS6uDwZ0y/',
  'instagram', 'Tastemade Japan',
  null,
  ARRAY['週末向け', '誰かに作りたい', 'ちょっと特別に', '週末の昼に'],
  NOW() - INTERVAL '14 days',
  'https://www.instagram.com/p/F1pS6uDwZ0y/', 'F1pS6uDwZ0y',
  array_fill(0.0::double precision, ARRAY[1536])::vector(1536)
)

ON CONFLICT (canonical_url) DO NOTHING;
