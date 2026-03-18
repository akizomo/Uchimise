-- プレースホルダーシードデータを削除し、実動画を受け入れられる状態にする。
-- 実行後に `pnpm ingest:feed` で feed_content を実動画で再投入すること。
--
-- 対象: 20260316000009_seed_feed_content.sql で挿入されたすべての行
-- 理由: 同ファイルの動画 ID はすべて架空のプレースホルダーであり、実在しない。

TRUNCATE TABLE feed_content;
