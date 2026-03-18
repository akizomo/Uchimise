# CLAUDE.md — Claude Code 作業ガイド

このファイルはClaude Codeが参照するプロジェクト固有の作業指針です。
プロダクト概要・設計方針は `.cursorrules` を参照してください。

---

## このプロジェクトで Claude Code に頼むこと

### 向いている作業
- Storybookコンポーネントの実装（tokens参照を前提に）
- APIエンドポイントの実装（型定義・バリデーション・テスト含む）
- データベースマイグレーションファイルの生成
- テストコード（Jest / React Native Testing Library）の生成
- リファクタリング（命名・型・構造の改善）
- ファイル横断の一括変更

### 向いていない作業（Cursorのインライン補完を使う）
- 1関数の軽微な修正
- デバッグの試行錯誤
- スタイルの微調整

---

## 作業指示のフォーマット

Claude Codeへの指示は以下の構造で書くと高品質な出力が得られます：

```
## Context
[どの機能・どの画面か。参照すべきファイルパスを明示]

## Task
[何を作るか・変更するかを1文で]

## Constraints
- @uchimise/tokens のカラー定数を必ず使う
- TypeScript strict 準拠
- テストを含める（対象ファイル名.test.ts）
- 感嘆符（！）をUIコピーに使わない

## Expected output
[生成してほしいファイル・関数・型の一覧]
```

---

## よく使うコマンド

```bash
# 開発サーバー起動
pnpm --filter mobile dev
pnpm --filter api dev

# Storybook
pnpm --filter ui storybook

# テスト
pnpm test
pnpm --filter mobile test

# 型チェック
pnpm typecheck

# リント
pnpm lint

# マイグレーション（Supabase）
supabase db push
supabase migration new <name>
```

---

## コンポーネント実装の手順

新しいコンポーネントを作るときは必ずこの順で：

1. `packages/tokens` に必要なトークンがあるか確認
2. `packages/ui/src/components/` にコンポーネントファイルを作成
3. Props インターフェースを定義（必ず型付け）
4. `packages/ui/src/stories/` にStorybookのStoryを作成
   - ライトモード・ダークモードの両方のStoryを用意
   - インタラクティブなPropsはcontrolsで操作できるようにする
5. `apps/mobile` で使う場合は `@uchimise/ui` からimportする

### コンポーネントファイルの雛形

```tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, spacing, radius, typography } from '@uchimise/tokens';

interface RecipeCardProps {
  title: string;
  creatorName: string;
  cookTimeMinutes: number;
  sourceType: 'youtube' | 'instagram';
  isSaved?: boolean;
  onPress?: () => void;
  onSavePress?: () => void;
}

export function RecipeCard({
  title,
  creatorName,
  cookTimeMinutes,
  sourceType,
  isSaved = false,
  onPress,
  onSavePress,
}: RecipeCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* implementation */}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.ivory,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.honey,
    overflow: 'hidden',
  },
});
```

---

## APIエンドポイント実装の手順

1. `apps/api/src/routes/` にルートファイルを作成
2. Zodでリクエスト/レスポンスのスキーマを定義
3. エラーハンドリングを必ず実装（SNS API失敗・LLM失敗・DBエラー）
4. `apps/api/src/routes/__tests__/` にテストを作成

### エンドポイントの雛形

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const extractRoute = new Hono();

const extractSchema = z.object({
  url: z.string().url(),
});

extractRoute.post('/', zValidator('json', extractSchema), async (c) => {
  const { url } = c.req.valid('json');

  try {
    // Phase 1: immediate extraction
    const phase1Result = await extractPhase1(url);
    
    // Trigger Phase 2 in background
    triggerPhase2(phase1Result.recipeId);
    
    return c.json({ success: true, data: phase1Result });
  } catch (error) {
    if (error instanceof PrivatePostError) {
      return c.json({ success: false, error: 'private_post' }, 422);
    }
    return c.json({ success: false, error: 'extraction_failed' }, 500);
  }
});
```

---

## デザイントークンの参照方法

```typescript
// ✅ 正しい使い方
import { colors, spacing, radius } from '@uchimise/tokens';

backgroundColor: colors.cream,
padding: spacing.lg,
borderRadius: radius.md,

// ❌ やってはいけない
backgroundColor: '#FAEEDA',  // ハードコード禁止
padding: 16,                  // マジックナンバー禁止
```

---

## ライト/ダーク対応の書き方

```typescript
import { useColorScheme } from 'react-native';
import { colors } from '@uchimise/tokens';

function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  return {
    bgPage:    isDark ? '#120A00' : colors.cream,
    bgSurface: isDark ? '#1E1000' : colors.ivory,
    bgNav:     isDark ? '#2A1600' : colors.ivory,
    textPrimary:   isDark ? colors.cream    : colors.espresso,
    textSecondary: isDark ? colors.mist     : colors.walnut,
    textTertiary:  isDark ? '#8B6040'       : colors.mist,
    border:    isDark ? 'rgba(250,199,117,0.12)' : 'rgba(250,199,117,0.5)',
  };
}
```

---

## よくあるエラーと対処法

### Supabase RLSエラー
- 原因: Row Level Securityのポリシーが未設定
- 対処: `supabase/migrations/` にRLSポリシーのマイグレーションを追加

### YouTube API クォータエラー
- 原因: 1日あたりのAPIクォータ上限に達した
- 対処: `YOUTUBE_QUOTA_EXCEEDED` エラーをキャッチしてフォールバック処理

### Claude API レート制限
- 原因: Phase 2の同時リクエストが多すぎる
- 対処: BullMQのキュー設定でconcurrencyを制限する

---

## UX COPY RULES

このプロジェクトのUIコピーは「行きつけの食料品店の物知りな店主」の言葉として書く。
詳細ルールは `docs/UX_VOICE_TONE.md` を参照。

### 絶対禁止

- 感嘆符（！）は一切使わない
- 「AIが〜しました」「自動生成」などの機能説明を表に出さない
- 「提案が的確になります」などアルゴリズムの効果を説明しない
- 「すごい！」「やったね！」などの過剰な賞賛
- 命令形（〜してください → 〜してみてください に置き換える）
- 連続記録・ストリーク・ログイン促進コピー
- `OK` `はい` `いいえ` だけのボタンラベル（動詞ラベルに変える）
- `キャンセル` `閉じる`（確認ダイアログ → `そのままにする` に変える）

### トーン

丁寧語ベース。`〜しませんか` `〜いかがですか` `〜してみてください` を基本とする。
タメ語・過剰な敬語・命令形は使わない。

### コピーパターン（即使えるテンプレート）

**保存・完了系**
- 保存完了:        「レシピを棚においておきました。」
- コレクション追加: 「「{コレクション名}」に加えました。」
- Phase 2処理中:   「材料と手順を整理しています…」
- Phase 2完了:     「材料と手順が整理されました。」
- 調理完了:        「できあがりました。{料理の一言描写}。お疲れさまでした。」

**エラー系（構造: 何が起きた ＋ 次の手）**
- 保存失敗:          「うまく保存できませんでした。もう一度試してみてください。」
- Private投稿:       「この投稿は非公開のようです。URLのみ保存しておきました。」
- 字幕なし:          「テキスト情報が取得できませんでした。手動で入力することもできます。」
- 重複URL:           「このレシピはすでに保存されています。」
- ネットワークエラー: 「接続を確認して、もう一度試してみてください。」

**エンプティステート系（構造: 状況 ＋ 次の一歩）**
- コレクション空:    「まだ棚が空です。SNSで見つけたレシピを、ここに並べてみませんか。」
- 調理履歴ゼロ:      「調理の記録がまだありません。作った料理がここに残っていきます。」
- 検索結果なし:      「「{検索語}」に合うレシピが見つかりませんでした。別の言葉で探してみてください。」
- 発見タブ初回:      「あなたの棚、少しずつ充実させていきましょう。レシピを保存するほど、あなたらしい棚になっていきます。」

**削除確認ダイアログ系（構造: 何が消えるか ＋ 影響 ＋ 動詞ボタン）**
- コレクション削除:  「コレクション「{名前}」を削除しますか？保存されているレシピは残ります。」→ [削除する] / [そのままにする]
- レシピ取り出し:    「このレシピを棚から取り出しますか？」→ [取り出す] / [そのままにする]
- 記録削除:          「この記録を消しますか？一度消すと、もとに戻せません。」→ [記録を消す] / [そのままにする]

**オンボーディング系**
- 歓迎:              「うちのお店へ、ようこそ。」
- 開始ボタン:        「はじめる」（「登録完了」「次へ」は使わない）
- スキップ:          「あとで設定する」（「スキップ」は使わない）
- 最後の画面:        「準備ができたら、扉を開けましょう。」

**献立未登録（時間帯別）**
- 〜10時:   「今日の朝ごはん、いかがですか。」
- 10〜14時: 「昼ごはんの支度、はじめませんか。」
- 14〜21時: 「今夜の一品、考えてみませんか。」
- 21時〜:   「明日の夕食、決めておきませんか。」

**CTAボタンラベル（動詞で始める）**
- 調理開始:       「調理する」
- 調理モード開始: 「はじめる」
- 記録保存:       「記録する」
- 終了:           「終わる」
- レシピ保存:     「棚に保存する」
- 献立追加:       「献立に入れる」
- SNS動画:        「動画で見る」

**プレースホルダー**
- 検索:           「レシピ・食材・気分で探す」
- コレクション名: 「例：平日の夜ごはん」
- メモ欄:         「次に作るときのメモ」

### コピーを書くとき・レビューするときのチェック

新しいコピーを生成したら以下を確認する:
1. 感嘆符（！）が含まれていない
2. 「AI」「自動」「生成」「的確になります」が表に出ていない
3. ボタンラベルが動詞で始まっている
4. エラーには「次の手」が含まれている
5. 空の状態には「次の一歩」が含まれている
6. 丁寧語ベース（〜しませんか、〜いかがですか）になっている
7. 連続記録・ログイン促進コピーが含まれていない
8. 削除確認のキャンセル側が「そのままにする」など動詞ラベルになっている

---

## 参照ドキュメント

- `.cursorrules` — プロジェクト概要・設計方針・ブランドガイドライン
- `docs/UX_VOICE_TONE.md` — UIコピーのボイス&トーン完全版
- `docs/ARCHITECTURE.md` — アーキテクチャ詳細・ADR
- `docs/DESIGN_SYSTEM.md` — コンポーネント仕様・Storybook運用
- `docs/API_SPEC.md` — 全APIエンドポイントの仕様
- `packages/tokens/src/index.ts` — デザイントークン定義
