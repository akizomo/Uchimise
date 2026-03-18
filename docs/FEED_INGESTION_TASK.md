# フィードインジェストジョブ 実装タスク

> Cursor向け実装指示書 — 2026年3月

---

## Context

`GET /api/feed` の発見フィードは `feed_content` テーブルを参照している。
このテーブルは現在プレースホルダーの動画IDしか入っておらず、実動画が1本も機能していない。

参照すべきファイル:
- `apps/api/src/data/feed_channels.json` — 取り込み元チャンネル一覧 + タグマッピング
- `supabase/migrations/20260316000006_create_feed_content.sql` — feed_content テーブル定義
- `supabase/migrations/20260316000009_seed_feed_content.sql` — 既存シード（後述の対応要）
- `apps/api/src/jobs/queue.ts` — 既存の BullMQ キュー設定（参考）
- `apps/api/src/routes/feed.ts` — フィード取得エンドポイント（参考）

---

## Task

YouTube Data API v3 でチャンネルの最新動画を定期取得し、`feed_content` へ upsert する
インジェストジョブとスクリプトを実装する。

---

## 実装するファイル一覧

```
apps/api/src/
├── data/
│   └── feed_channels.json          （作成済み）
├── jobs/
│   ├── feedIngestionJob.ts          （新規作成）
│   └── feedIngestionWorker.ts       （新規作成）
├── scripts/
│   └── ingestFeed.ts                （新規作成 — 手動実行用）
├── services/
│   └── feed/
│       ├── youtubeIngester.ts       （新規作成）
│       └── instagramIngester.ts     （新規作成 — スタブでOK）
└── types/
    └── feedIngestion.ts             （新規作成）
```

---

## Constraints

- TypeScript strict 準拠。`any` 禁止
- YouTube Data API v3 のクォータ消費を最小化する
  - `search.list` (コスト100) は使わず `playlistItems.list` (コスト1) でアップロード一覧を取得する
  - 各チャンネルの `uploadsPlaylistId` は `channels.list` で1回だけ取得してキャッシュする
- feed_channels.json の `channelId` が null のエントリは `channels.list?forHandle=` で解決してから処理する
- 重複排除: `source_url` に UNIQUE 制約があるため、upsert は `ON CONFLICT (source_url) DO NOTHING`
- タグ: `feed_channels.json` の `tags` を固定タグとして使用する（動画タイトルからの自動生成は後フェーズ）
- Instagram は現時点でスタブ実装でよい（`instagramIngester.ts` は関数シグネチャのみ）
- エラー処理: 1チャンネルの失敗が他チャンネルの処理を止めないこと（try/catch per channel）
- ログ: `console.error` ではなく `console.warn` / `console.error` を用途に応じて使い分ける

---

## 詳細仕様

### 1. YouTubeIngester (`youtubeIngester.ts`)

```typescript
// 期待するインターフェース
export async function ingestChannel(
  channel: YouTubeChannelConfig,
  apiKey: string
): Promise<{ inserted: number; skipped: number; error?: string }>
```

処理フロー:
1. `channelId` が null なら `channels.list?forHandle=` でIDを取得
2. `channels.list?part=contentDetails` でそのチャンネルの `uploadsPlaylistId` を取得
3. `playlistItems.list?playlistId=&maxResults=` で最新動画を取得
4. 各動画を `feed_content` にupsert
   - `source_url`: `https://www.youtube.com/watch?v={videoId}`
   - `thumbnail_url`: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`
   - `source_type`: `'youtube'`
   - `published_at`: `snippet.publishedAt`
   - `tags`: チャンネルの固定タグ（`feed_channels.json` から）
   - `embedding`: `array_fill(0.0, ARRAY[1536])::vector(1536)` （Phase2で後から更新）

### 2. FeedIngestionJob (`feedIngestionJob.ts`)

BullMQ ジョブとして定義。`phase2Queue` と同様のパターンで実装する。

```typescript
export interface FeedIngestionJobData {
  triggeredBy: 'cron' | 'manual';
  channelIds?: string[]; // 指定時は該当チャンネルのみ処理
}
```

### 3. 手動スクリプト (`scripts/ingestFeed.ts`)

```bash
# 全チャンネル
pnpm ingest:feed

# 特定チャンネルのみ（デバッグ用）
pnpm ingest:feed --channel UCW01sMEVYQdhcvkrhbxdBpw
```

`package.json` に以下を追加:
```json
"ingest:feed": "tsx apps/api/src/scripts/ingestFeed.ts"
```

### 4. Cron スケジュール

毎週月曜 5:00 JST（`0 20 * * 0` UTC）に全チャンネルを処理する。
既存の BullMQ + Upstash Redis 構成に乗せる。

---

## 環境変数

`apps/api/.env` に追加が必要:

```env
YOUTUBE_API_KEY=                  # Google Cloud Console で取得
# INSTAGRAM_ACCESS_TOKEN=         # Phase 2以降（現時点不要）
```

`apps/api/src/types/env.d.ts` または `.env.example` にも追記すること。

---

## シードファイルの扱い

`supabase/migrations/20260316000009_seed_feed_content.sql` の動画URLは
すべてプレースホルダーのため、**本番DBには適用しないこと**。

コールドスタート手順:
```bash
# 1. 上記マイグレーションを skip（または空のseedに差し替え）
# 2. インジェストスクリプトを手動実行して実動画を投入
pnpm ingest:feed
```

開発環境でのみ使いたい場合は、マイグレーションファイルの先頭に以下を追加:
```sql
-- DEV ONLY: placeholder seed. Run `pnpm ingest:feed` for production data.
```

---

## テスト

`apps/api/src/jobs/__tests__/feedIngestionJob.test.ts` を作成する。

- YouTube API をモック（`jest.mock`）して実際にクォータを消費しない
- 正常系: 動画が正しく upsert されること
- 重複系: 同じ `source_url` を2回処理しても `inserted` が増えないこと
- エラー系: 1チャンネルで API エラーが起きても他チャンネルが処理されること
- クォータ節約: `search.list` が呼ばれていないこと（`playlistItems.list` を使っていること）

---

## Expected output

実装完了後に機能するコマンド:

```bash
# 動作確認
pnpm ingest:feed
# → feed_content に実動画が投入される

# テスト
pnpm --filter api test feedIngestionJob
# → すべてパス

# 型チェック
pnpm typecheck
# → エラーなし
```
