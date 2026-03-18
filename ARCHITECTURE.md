# Architecture — Uchimise

> 最終更新: 2026年3月

---

## システム全体図

```
┌─────────────────────────────────────────────────────────┐
│  iOS App (React Native + Expo)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 献立タブ  │  │ 発見タブ  │  │ 自分タブ  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ @uchimise/ui (Storybook components)              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ @uchimise/tokens (design tokens)                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────┐
│  API (Node.js + Hono on Vercel Edge)                    │
│                                                         │
│  POST /api/extract    → SNS URL → Phase 1 即返却        │
│  POST /api/recipes    → レシピ保存                       │
│  GET  /api/feed       → 発見フィード                     │
│  GET  /api/collections → コレクション管理                │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ YouTube    │  │ Claude API │  │ BullMQ (Phase 2) │  │
│  │ Data API   │  │ sonnet-4-6 │  │ background jobs  │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Supabase                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │ Postgres  │  │ Realtime │             │
│  │  OAuth   │  │ pgvector  │  │  (Phase2 │             │
│  │ Apple/G  │  │   RLS     │  │  notify) │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## データモデル（全テーブル）

> 凡例: ✅ 既存 / 🆕 新規 / ⚠️ 更新 / 🔜 v1.0 / 💜 v1.5

---

### USER DOMAIN

#### users ✅
| column | type | description |
|---|---|---|
| id | uuid PK | Supabase Auth が発行 |
| email | text | 認証用 |
| display_name | text | optional |
| created_at | timestamptz | |

#### user_preferences 🆕🔜
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK UNIQUE → users | |
| dietary_restrictions | text[] | vegan / gluten_free / dairy_free など |
| dislikes | text[] | 嫌いな食材名 |
| skill_level | int | 1-5（1=初心者） |
| max_cook_time_minutes | int | 調理可能な最大時間（分） |
| discovery_appetite | int | 1-5（1=慣れ親しんだもの / 5=新発見積極） |

---

### CREATOR DOMAIN

#### creators 🆕✅
| column | type | description |
|---|---|---|
| id | uuid PK | |
| name | text | チャンネル表示名 |
| platform | enum('youtube','instagram','tiktok') | |
| platform_channel_id | text | YouTube channel ID など |
| profile_image_url | text | optional |
| genre_tags | text[] | 得意ジャンル |
| created_at | timestamptz | |

#### user_follows_creator ⚠️
| column | type | description |
|---|---|---|
| user_id | uuid FK PK → users | |
| creator_id | uuid FK PK → creators | ※ creator_name text から FK に昇格 |
| notification_enabled | boolean | default true |
| followed_at | timestamptz | |

---

### RECIPE DOMAIN

#### recipes ⚠️
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| creator_id | uuid FK → creators | 🆕 optional（Phase 2 で設定） |
| creator_name | text | 非正規化キャッシュ（JOIN 軽減） |
| title | text | |
| source_url | text UNIQUE | 重複チェック用 |
| source_type | enum('youtube','instagram','tiktok','web') | |
| thumbnail_url | text | optional |
| cook_time_minutes | int | Phase 2 で確定。Phase 1 は null の可能性 |
| serving_size | int | 🆕 人数（デフォルト 1-2 人前） |
| phase | enum('phase1','phase2','manual') | 抽出フェーズ |
| bookmark_status | enum('saved','want_to_cook','cooked') | 🆕 ブックマーク状態 |
| tags | text[] | 自動付与タグ（時短・作り置きなど） |
| mood_tags | text[] | 🆕 あっさり / こってり / 簡単 / 特別感 |
| created_at | timestamptz | |

> **移行メモ**: `ingredients jsonb` と `steps jsonb` は削除。recipe_ingredients / recipe_steps テーブルに移行。`extraction_status` は extraction_jobs テーブルに分離。

#### recipe_ingredients 🆕✅ ※ recipes.ingredients jsonb から正規化
| column | type | description |
|---|---|---|
| id | uuid PK | substitutions の FK |
| recipe_id | uuid FK → recipes | |
| name | text | 食材名（例：鶏もも肉） |
| amount | text | 分量（Phase 1 では null の可能性） |
| unit | text | 単位（g / 個 / 大さじ） |
| order | int | 表示順 |
| is_optional | boolean | 省略可能食材。default false |

#### substitutions 🆕
| column | type | description |
|---|---|---|
| id | uuid PK | |
| ingredient_id | uuid FK → recipe_ingredients | |
| alt_name | text | 代替食材名（例：豆乳） |
| impact_note | text | 味・食感への影響（optional） |
| source | enum('ai_generated','manual') | |

#### recipe_steps 🆕🔜 ※ recipes.steps jsonb から正規化
| column | type | description |
|---|---|---|
| id | uuid PK | |
| recipe_id | uuid FK → recipes | |
| order | int | 手順番号（1始まり） |
| text | text | 手順テキスト |
| duration_minutes | int | このステップの目安時間（optional） |
| tip | text | 調理のコツ（Phase 2 で AI 生成、optional） |

#### extraction_jobs 🆕
| column | type | description |
|---|---|---|
| id | uuid PK | |
| recipe_id | uuid FK → recipes | |
| phase | enum('phase1','phase2') | |
| status | enum('pending','processing','done','failed') | |
| error_code | text | private_post / no_caption / quota_exceeded / llm_error |
| attempts | int | リトライ回数。default 0 |
| started_at | timestamptz | optional |
| completed_at | timestamptz | optional |

---

### ORGANIZATION DOMAIN

#### collections ✅
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| name | text | |
| is_auto | boolean | 店主おすすめは true |
| created_at | timestamptz | |

#### collection_recipes ✅
| column | type | description |
|---|---|---|
| collection_id | uuid FK PK → collections | |
| recipe_id | uuid FK PK → recipes | |
| added_at | timestamptz | |

#### cuisine_genres 🆕💜
| column | type | description |
|---|---|---|
| id | uuid PK | |
| name | text UNIQUE | 和食 / 洋食 / 中華 / エスニック / イタリアン など |
| icon_name | text | SF Symbols / Emoji（optional） |

#### recipe_genres 🆕💜 ※ 中間テーブル
| column | type | description |
|---|---|---|
| recipe_id | uuid FK PK → recipes | |
| genre_id | uuid FK PK → cuisine_genres | |

---

### MEAL PLAN DOMAIN

#### meal_plans ✅
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| week_start_date | date | 週の開始日（月曜日） |
| created_at | timestamptz | |

#### meal_plan_entries 🆕
| column | type | description |
|---|---|---|
| id | uuid PK | |
| meal_plan_id | uuid FK → meal_plans | |
| recipe_id | uuid FK → recipes | |
| date | date | 対象日（YYYY-MM-DD） |
| meal_slot | enum('breakfast','lunch','dinner') | |

#### shopping_lists 🆕🔜
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| meal_plan_id | uuid FK → meal_plans | optional（手動作成も可） |
| generated_at | timestamptz | |
| note | text | optional |

#### shopping_items 🆕🔜
| column | type | description |
|---|---|---|
| id | uuid PK | |
| list_id | uuid FK → shopping_lists | |
| ingredient_name | text | |
| amount | text | 合算量（optional） |
| unit | text | 単位（optional） |
| category | text | 野菜 / 肉・魚 / 調味料 / 乳製品 / 穀物 / その他 |
| is_checked | boolean | 購入済み。default false |
| is_manually_added | boolean | ユーザー手動追加。default false |

---

### COOKING DOMAIN

#### cooking_records ⚠️
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| recipe_id | uuid FK → recipes | |
| cooked_at | timestamptz | |
| note | text | optional |
| photo_url | text | 🆕 完成写真URL（Supabase Storage） |
| rating | int | 🆕 満足度 1-5（再調理率KPI用） |
| would_make_again | boolean | 🆕 また作りたいか（optional） |

#### cooking_sessions 🆕🔜 ※ 必要性は UXリサーチ後に確定
| column | type | description |
|---|---|---|
| id | uuid PK | |
| cooking_record_id | uuid FK → cooking_records | |
| current_step_order | int | 現在のステップ番号 |
| started_at | timestamptz | |
| timer_state | jsonb | タイマー残り時間 {stepId, remainMs}（optional） |

---

### DISCOVERY DOMAIN

#### feed_content ⚠️（編集部シードコンテンツ）
| column | type | description |
|---|---|---|
| id | uuid PK | |
| creator_id | uuid FK → creators | 🆕 optional |
| creator_name | text | 非正規化キャッシュ |
| title | text | |
| source_url | text | |
| source_type | enum('youtube','instagram') | |
| thumbnail_url | text | optional |
| tags | text[] | |
| embedding | vector(1536) | pgvector 類似検索 |
| published_at | timestamptz | |

---

### GROWTH DOMAIN (v1.5)

#### user_skill_stats 🆕💜
| column | type | description |
|---|---|---|
| user_id | uuid FK PK → users | 複合主キー |
| genre_id | uuid FK PK → cuisine_genres | 複合主キー |
| cook_count | int | このジャンルの調理回数 |
| last_cooked_at | timestamptz | 最終調理日時 |

---

### PANTRY DOMAIN (v1.5)

#### pantry_items 🆕💜
| column | type | description |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | |
| name | text | 食材名 |
| amount | text | 残量（optional） |
| unit | text | 単位（optional） |
| category | text | 野菜 / 肉・魚 / 調味料 など |
| expiry_date | date | 賞味期限（optional） |
| added_at | timestamptz | |

---

## スキーマ変更方針（jsonb → 正規化）

| 現行フィールド | 移行先 | 優先度 |
|---|---|---|
| recipes.ingredients jsonb | recipe_ingredients テーブル | MVP（代替食材機能の前提） |
| recipes.steps jsonb | recipe_steps テーブル | v1.0（ステップタイマー実装前） |
| recipes.extraction_status | extraction_jobs テーブルに分離 | MVP（リトライ管理改善） |
| recipes.creator_name text のみ | creators テーブル + FK | MVP（フォロー機能前提） |
| recipes.tags[] にジャンル混在 | cuisine_genres + recipe_genres | v1.5（習熟マップ前提） |

---

## SNS抽出パイプライン

### Phase 1（3秒以内）
```
URL受信
  ↓
SNS種別判定（YouTube / Instagram）
  ↓
YouTube: Data API v3で動画メタデータ取得
  ↓
概要欄テキスト / キャプションを取得
  ↓
正規表現 + 簡易NLPで材料品名を粗抽出
  ↓
recipes テーブルに phase='phase1' で保存
  ↓
Phase 1結果をクライアントに即返却
  ↓
Phase 2ジョブをBullMQキューに積む（非同期）
```

### Phase 2（30秒以内・バックグラウンド）
```
BullMQジョブ実行
  ↓
Claude API (claude-sonnet-4-6) に構造化プロンプト送信
  - 材料: 品名・分量・単位の正規化
  - 手順: ステップ構造化
  - タグ: 自動付与（時短・作り置き・ヘルシーなど）
  ↓
抽出精度チェック（閾値80%未満は unconfirmed フラグ）
  ↓
recipes テーブルを phase='phase2' に更新
  ↓
Supabase Realtimeでクライアントに通知
  ↓
iOS プッシュ通知送信（Expo Notifications）
```

### エラーハンドリング
| エラー種別 | 対処 |
|---|---|
| Instagram Private投稿 | URL のみ保存。エラーコード `private_post` を返す |
| 字幕・概要欄なし動画 | 手動入力モードに切り替え。`manual_required` を通知 |
| 重複URL | `already_saved` を返して既存レシピIDを添付 |
| LLM API失敗 | 3回リトライ後にPhase 1状態のまま保存。`extraction_partial` でフラグ |
| YouTube APIクォータ超過 | `quota_exceeded` でフォールバック。翌日リトライ |

---

## アーキテクチャ決定記録（ADR）

### ADR-001: React Native (Expo) を採用
- **決定**: Expo managed workflow を採用
- **理由**: iOS優先でAndroidを後追いする要件と相性が良い。OTAアップデートが使える。Expo Notificationsで通知が簡単に実装できる
- **トレードオフ**: ネイティブモジュールの自由度は下がる。必要になればbare workflowに移行

### ADR-002: Supabase を BaaS として採用
- **決定**: PostgreSQL + Supabase
- **理由**: RLSでユーザーデータの分離が容易。Auth・Realtime・pgvectorが一体で管理コストが低い。初期フェーズのスケールに十分
- **トレードオフ**: ベンダーロックインのリスク。ただしPostgreSQLなので移行は可能

### ADR-003: Claude API を Phase 2 抽出に採用
- **決定**: claude-sonnet-4-6 をPhase 2の材料正規化・手順構造化に使用
- **理由**: 日本語料理レシピの構造化に最も精度が高い。APIが安定している
- **コスト対策**: Phase 1（正規表現）でカバーできた項目はPhase 2をスキップしてLLM呼び出しを最小化。claude-haiku-4-5への切り替えも検討

### ADR-004: モノレポ (pnpm workspaces) を採用
- **決定**: pnpm workspaces でmobile・api・tokens・uiを単一リポジトリで管理
- **理由**: デザイントークンをSingle source of truthにするため。TypeScriptの型をmobileとapi間で共有するため
- **トレードオフ**: CI/CDの設定がやや複雑になる

### ADR-005: ライト/ダークモードをクラスベースで制御
- **決定**: `@media (prefers-color-scheme: dark)` を使わず、クラス/状態ベースで切り替える
- **理由**: プロトタイプ段階でmediaクエリがデモ環境のOS設定に反応して意図しない挙動を示した
- **実装**: `useColorScheme()` フックで取得し、themeオブジェクトを生成して使う

---

## パフォーマンス目標

| 指標 | 目標 | 測定方法 |
|---|---|---|
| SNS URL → Phase 1表示 | 3秒以内 (P95) | APIエンドポイントのレスポンスタイム |
| アプリコールドスタート | 3秒以内 | Expo + Hermes起動時間 |
| フィード初回表示 | 2秒以内 | pgvectorクエリ + API往復 |
| Phase 2完了 | 30秒以内 (P95) | BullMQジョブ完了時間 |
| 可用性 | 99.5%以上（月次） | Vercelダッシュボード |

---

## セキュリティ

- 認証: Supabase Auth（Apple Sign-In / Google OAuth 2.0）
- データ分離: Row Level Security（全テーブルでuser_id条件）
- APIキー: 環境変数で管理。コードに直接書かない
- SNS URL: ユーザー入力値はバリデーション後にAPIコールに使用
- LLMプロンプトインジェクション: レシピ抽出用のプロンプトはシステム側で固定
