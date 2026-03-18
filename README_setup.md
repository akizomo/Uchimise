# Uchimise — 開発環境引き継ぎドキュメント

このフォルダをGitHubリポジトリのルートに配置してください。

---

## ファイル一覧

| ファイル | 配置先 | 用途 |
|---|---|---|
| `.cursorrules` | リポジトリルート | Cursor / Claude Code が自動参照するプロジェクト文脈ファイル |
| `CLAUDE.md` | リポジトリルート | Claude Code への作業指示フォーマット・コマンド集 |
| `docs/ARCHITECTURE.md` | `docs/` | システム構成・データモデル・ADR |
| `docs/DESIGN_SYSTEM.md` | `docs/` | デザイントークン・コンポーネント仕様・UXコピー原則 |

---

## セットアップ手順

```bash
# 1. リポジトリ作成後
git clone https://github.com/your-org/uchimise.git
cd uchimise

# 2. このフォルダの内容をルートに配置
cp .cursorrules ../
cp CLAUDE.md ../
cp -r docs ../

# 3. monorepo初期化
pnpm init
# pnpm-workspace.yaml を作成:
# packages:
#   - 'apps/*'
#   - 'packages/*'

# 4. 各パッケージを初期化
mkdir -p apps/mobile apps/api packages/tokens packages/ui

# 5. Cursor で開く
cursor .
# または
code .  # VSCode

# 6. Claude Code を起動
# Cursor内のターミナルから:
claude
```

---

## これまでの経緯（この会話のまとめ）

### 何を作ったか
SNS（YouTube/Instagram）でみつけた料理動画を保存・献立計画・調理まで一気通貫で行えるiOSアプリ「Uchimise（うちのお店、開けよう。）」のプロダクト設計とUIプロトタイプ。

### 完成しているもの
- **BRD v0.3** — 機能要件・受け入れ条件・ロードマップ
- **ユーザーリサーチ** — ペルソナ・カスタマージャーニーマップ
- **ブランドガイドライン v2.1** — Spice Ochreパレット・セマンティックカラー・Goldenrod追加
- **UIプロトタイプ（HTML）**:
  - ホーム画面 v4（献立/発見/自分タブ、ライト/ダーク切り替え）
  - レシピ詳細画面（情報確認モード・調理モード・代替食材UX）
  - SNS保存フロー（Phase 1/2・エラー状態・シェアシート）
- **開発プラン v2.0** — Sprint計画・フロントエンドトラック・Cursor/Claude Code連携方針

### 主要な設計決定
1. **ナビゲーション**: 3タブ（献立・発見・自分）。iOS HIG準拠でヘッダー左にタブ名
2. **献立タブ**: 週間カレンダー固定ヘッダー + セグメント（レシピ/買い出し）
3. **ライト/ダーク**: Espressoをダークモードのナビ背景として活用。ライトはIvory/Cream
4. **warningカラー**: OchreとGoldenrodを分離（Ochre=CTA専用、Goldenrod=warning専用）
5. **調理モード遷移**: 「調理する」ボタン→調理モード→「←戻る」の一方通行
6. **SNS抽出**: Phase 1（正規表現、3秒以内）→Phase 2（Claude API、30秒以内）の2フェーズ

### 次のステップ
→ `docs/ARCHITECTURE.md` の「次のアクション」を参照
