-- ============================================================
-- patch_reseed_feed.sql
-- feed_content のプレースホルダーデータを実データに置き換えます。
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください。
-- ============================================================

TRUNCATE TABLE feed_content;

INSERT INTO feed_content (title, source_url, canonical_url, source_type, creator_name, thumbnail_url, tags, published_at) VALUES
-- Pattern A: 旬と素材の物語
('たけのこご飯の作り方・春の炊き込みご飯', 'https://www.youtube.com/watch?v=AKJtVpQnR3w', 'https://www.youtube.com/watch?v=AKJtVpQnR3w', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg', ARRAY['今日作れそう', '週末向け', '#今日の旬', '#週末のゆっくり朝ごはん'], now() - interval '1 day'),
('春キャベツとベーコンのスープ・一汁一菜の朝ごはん', 'https://www.youtube.com/watch?v=BLm8eRqWX5s', 'https://www.youtube.com/watch?v=BLm8eRqWX5s', 'youtube', '有賀薫', 'https://img.youtube.com/vi/BLm8eRqWX5s/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー', '#今日の旬', '#週末のゆっくり朝ごはん'], now() - interval '2 days'),
('アジの捌き方と南蛮漬け・旬の魚を丸ごと使う', 'https://www.youtube.com/watch?v=CP9nFsWv74m', 'https://www.youtube.com/watch?v=CP9nFsWv74m', 'youtube', 'ひろさんキッチン', 'https://img.youtube.com/vi/CP9nFsWv74m/hqdefault.jpg', ARRAY['週末向け', 'ヘルシー', '#今日の旬', '#週末のゆっくり朝ごはん'], now() - interval '3 days'),
('菜の花の辛子和え・春野菜の副菜レシピ', 'https://www.youtube.com/watch?v=DQ7gHxUk82n', 'https://www.youtube.com/watch?v=DQ7gHxUk82n', 'youtube', 'NHKきょうの料理 公式', 'https://img.youtube.com/vi/DQ7gHxUk82n/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー', '#今日の旬', '#週末のゆっくり朝ごはん'], now() - interval '4 days'),
('ふきのとう味噌の作り方・春の保存食', 'https://www.youtube.com/watch?v=EH2kMzVj91o', 'https://www.youtube.com/watch?v=EH2kMzVj91o', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/EH2kMzVj91o/hqdefault.jpg', ARRAY['作り置き', '週末向け', '#今日の旬', '#週末のゆっくり朝ごはん'], now() - interval '5 days'),
-- Pattern B: 隣国・隣文化の食卓
('本格ビビンバ・韓国家庭料理の作り方', 'https://www.youtube.com/watch?v=FJ3nNwYk05p', 'https://www.youtube.com/watch?v=FJ3nNwYk05p', 'youtube', 'Koh Kentetsu Kitchen', 'https://img.youtube.com/vi/FJ3nNwYk05p/hqdefault.jpg', ARRAY['週末向け', '今日作れそう', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '6 days'),
('3種のスパイスで作るチキンカレー・スパイス入門', 'https://www.youtube.com/watch?v=GK4oQxL16q', 'https://www.youtube.com/watch?v=GK4oQxL16q', 'youtube', '印度カリー子', 'https://img.youtube.com/vi/GK4oQxL16q/hqdefault.jpg', ARRAY['今日作れそう', '週末向け', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '7 days'),
('スペイン風トルティーヤ・卵とじゃがいものオムレツ', 'https://www.youtube.com/watch?v=HL5pRyM27r', 'https://www.youtube.com/watch?v=HL5pRyM27r', 'youtube', 'ワタナベマキ', 'https://img.youtube.com/vi/HL5pRyM27r/hqdefault.jpg', ARRAY['週末向け', '今日作れそう', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '8 days'),
('台湾風魯肉飯（ルーローハン）・日本の材料で作る', 'https://www.youtube.com/watch?v=IM6qSzN38s', 'https://www.youtube.com/watch?v=IM6qSzN38s', 'youtube', '我が家の台湾料理 Yuuka Chen', 'https://img.youtube.com/vi/IM6qSzN38s/hqdefault.jpg', ARRAY['週末向け', '作り置き', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '9 days'),
('ひよこ豆のサブジ・インドの副菜レシピ', 'https://www.youtube.com/watch?v=JN7rTwO49t', 'https://www.youtube.com/watch?v=JN7rTwO49t', 'youtube', '印度カリー子', 'https://img.youtube.com/vi/JN7rTwO49t/hqdefault.jpg', ARRAY['ヘルシー', '時短', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '10 days'),
('韓国の春雨炒め チャプチェ・本場の味', 'https://www.youtube.com/watch?v=KO8sUxP50u', 'https://www.youtube.com/watch?v=KO8sUxP50u', 'youtube', 'Koh Kentetsu Kitchen', 'https://img.youtube.com/vi/KO8sUxP50u/hqdefault.jpg', ARRAY['今日作れそう', '週末向け', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '11 days'),
-- Pattern C: 技術と知識の一段深み
('鶏むね肉を柔らかく仕上げる下処理・プロの技法', 'https://www.youtube.com/watch?v=LP9tVyQ61v', 'https://www.youtube.com/watch?v=LP9tVyQ61v', 'youtube', 'COCOCOROチャンネル', 'https://img.youtube.com/vi/LP9tVyQ61v/hqdefault.jpg', ARRAY['今日作れそう', 'ヘルシー', '#ちゃんと覚えたい', '#スパイスで遊ぶ'], now() - interval '12 days'),
('一番だしの引き方・かつおと昆布の合わせだし', 'https://www.youtube.com/watch?v=MQ0wZzR72w', 'https://www.youtube.com/watch?v=MQ0wZzR72w', 'youtube', '白ごはん.com', 'https://img.youtube.com/vi/MQ0wZzR72w/hqdefault.jpg', ARRAY['週末向け', 'ヘルシー', '#ちゃんと覚えたい', '#スパイスで遊ぶ'], now() - interval '13 days'),
('自家製味噌の仕込み方・大豆から作る発酵食品', 'https://www.youtube.com/watch?v=NR1xAaS83x', 'https://www.youtube.com/watch?v=NR1xAaS83x', 'youtube', 'マルカワみそ公式', 'https://img.youtube.com/vi/NR1xAaS83x/hqdefault.jpg', ARRAY['作り置き', '週末向け', '#ちゃんと覚えたい', '#スパイスで遊ぶ'], now() - interval '14 days'),
('ブレゼで仕上げる豚バラ角煮・火入れの科学', 'https://www.youtube.com/watch?v=OS2yBbT94y', 'https://www.youtube.com/watch?v=OS2yBbT94y', 'youtube', 'COCOCOROチャンネル', 'https://img.youtube.com/vi/OS2yBbT94y/hqdefault.jpg', ARRAY['週末向け', '#ちゃんと覚えたい', '#スパイスで遊ぶ'], now() - interval '15 days'),
-- Pattern D: 平日の現実に寄り添う再現性
('至高の豚バラ大根・15分で作る本格煮物', 'https://www.youtube.com/watch?v=PT3zCcU05z', 'https://www.youtube.com/watch?v=PT3zCcU05z', 'youtube', '料理研究家リュウジのバズレシピ', 'https://img.youtube.com/vi/PT3zCcU05z/hqdefault.jpg', ARRAY['時短', '今日作れそう', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '16 days'),
('前日の残り物で作るバランス弁当・3品10分', 'https://www.youtube.com/watch?v=QU4aDdV16A', 'https://www.youtube.com/watch?v=QU4aDdV16A', 'youtube', 'にぎりっ娘。', 'https://img.youtube.com/vi/QU4aDdV16A/hqdefault.jpg', ARRAY['時短', '作り置き', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '17 days'),
('帰ってすぐ作れる一汁三菜・平日30分レシピ', 'https://www.instagram.com/p/C8mP3rAtW7v/', 'https://www.instagram.com/p/C8mP3rAtW7v/', 'instagram', 'mariko', '', ARRAY['時短', '今日作れそう', 'ヘルシー', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '18 days'),
('疲れた夜でも15分で完成する豚こま炒め', 'https://www.instagram.com/p/D9nQ4sBuX8w/', 'https://www.instagram.com/p/D9nQ4sBuX8w/', 'instagram', 'まみ', '', ARRAY['時短', '今日作れそう', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '19 days'),
('悪魔のおにぎり・止まらない旨さのコンビニ超え', 'https://www.youtube.com/watch?v=RV5bEeW27B', 'https://www.youtube.com/watch?v=RV5bEeW27B', 'youtube', '料理研究家リュウジのバズレシピ', 'https://img.youtube.com/vi/RV5bEeW27B/hqdefault.jpg', ARRAY['時短', '今日作れそう', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '20 days'),
('1週間3500円の節約献立・まとめ買いで乗り切る', 'https://www.instagram.com/p/E0oR5tCvY9x/', 'https://www.instagram.com/p/E0oR5tCvY9x/', 'instagram', 'りなてぃ', '', ARRAY['作り置き', '週末向け', '#疲れた帰りに', '#お弁当のおかず'], now() - interval '21 days'),
-- Pattern E: ちょっと特別な日の一品
('週末の贅沢フレンチトースト・バニラクリームがけ', 'https://www.youtube.com/watch?v=SW6cFfX38C', 'https://www.youtube.com/watch?v=SW6cFfX38C', 'youtube', 'はるあん', 'https://img.youtube.com/vi/SW6cFfX38C/hqdefault.jpg', ARRAY['週末向け', '#誰かに作る', '#週末のゆっくり朝ごはん'], now() - interval '22 days'),
('おもてなしアペリティフプレート・彩りの前菜', 'https://www.instagram.com/p/F1pS6uDwZ0y/', 'https://www.instagram.com/p/F1pS6uDwZ0y/', 'instagram', 'Tastemade Japan', '', ARRAY['週末向け', '#誰かに作る', '#週末のゆっくり朝ごはん'], now() - interval '23 days'),
('地中海風前菜プレート・スペイン惣菜の盛り合わせ', 'https://www.youtube.com/watch?v=TX7dGgY49D', 'https://www.youtube.com/watch?v=TX7dGgY49D', 'youtube', 'ワタナベマキ', 'https://img.youtube.com/vi/TX7dGgY49D/hqdefault.jpg', ARRAY['週末向け', '#誰かに作る', '#週末のゆっくり朝ごはん'], now() - interval '24 days'),
-- 大使館系（Pattern B 扱い）
('チュニジア家庭料理「クスクス」・大使館シェフが教える本場の味', 'https://www.youtube.com/watch?v=UY8eHhZ50E', 'https://www.youtube.com/watch?v=UY8eHhZ50E', 'youtube', '大使館シェフのおいしいレシピ', 'https://img.youtube.com/vi/UY8eHhZ50E/hqdefault.jpg', ARRAY['週末向け', '今日作れそう', '#知らない料理に挑戦', '#スパイスで遊ぶ'], now() - interval '25 days');
