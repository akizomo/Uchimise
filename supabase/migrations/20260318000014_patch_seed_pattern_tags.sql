-- 既存 feed_content シードデータにパターンタグを追加
-- diversify.ts の detectPattern() が認識する #タグ を気分タグに append する

-- Pattern A: #今日の旬
UPDATE feed_content SET tags = array_cat(tags, ARRAY['#今日の旬', '#週末のゆっくり朝ごはん'])
WHERE source_url IN (
  'https://www.youtube.com/watch?v=AKJtVpQnR3w',
  'https://www.youtube.com/watch?v=BLm8eRqWX5s',
  'https://www.youtube.com/watch?v=CP9nFsWv74m',
  'https://www.youtube.com/watch?v=DQ7gHxUk82n',
  'https://www.youtube.com/watch?v=EH2kMzVj91o'
);

-- Pattern B: #知らない料理に挑戦
UPDATE feed_content SET tags = array_cat(tags, ARRAY['#知らない料理に挑戦', '#スパイスで遊ぶ'])
WHERE source_url IN (
  'https://www.youtube.com/watch?v=FJ3nNwYk05p',
  'https://www.youtube.com/watch?v=GK4oQxL16q',
  'https://www.youtube.com/watch?v=HL5pRyM27r',
  'https://www.youtube.com/watch?v=IM6qSzN38s',
  'https://www.youtube.com/watch?v=JN7rTwO49t',
  'https://www.youtube.com/watch?v=KO8sUxP50u',
  'https://www.youtube.com/watch?v=UY8eHhZ50E'
);

-- Pattern C: #ちゃんと覚えたい
UPDATE feed_content SET tags = array_cat(tags, ARRAY['#ちゃんと覚えたい', '#スパイスで遊ぶ'])
WHERE source_url IN (
  'https://www.youtube.com/watch?v=LP9tVyQ61v',
  'https://www.youtube.com/watch?v=MQ0wZzR72w',
  'https://www.youtube.com/watch?v=NR1xAaS83x',
  'https://www.youtube.com/watch?v=OS2yBbT94y'
);

-- Pattern D: #疲れた帰りに
UPDATE feed_content SET tags = array_cat(tags, ARRAY['#疲れた帰りに', '#お弁当のおかず'])
WHERE source_url IN (
  'https://www.youtube.com/watch?v=PT3zCcU05z',
  'https://www.youtube.com/watch?v=QU4aDdV16A',
  'https://www.instagram.com/p/C8mP3rAtW7v/',
  'https://www.instagram.com/p/D9nQ4sBuX8w/',
  'https://www.youtube.com/watch?v=RV5bEeW27B',
  'https://www.instagram.com/p/E0oR5tCvY9x/'
);

-- Pattern E: #誰かに作る
UPDATE feed_content SET tags = array_cat(tags, ARRAY['#誰かに作る', '#週末のゆっくり朝ごはん'])
WHERE source_url IN (
  'https://www.youtube.com/watch?v=SW6cFfX38C',
  'https://www.instagram.com/p/F1pS6uDwZ0y/',
  'https://www.youtube.com/watch?v=TX7dGgY49D'
);

-- canonical_url のバックフィル
UPDATE feed_content SET canonical_url = source_url WHERE canonical_url IS NULL;
