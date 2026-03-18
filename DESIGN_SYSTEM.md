# Design System — Uchimise

> ブランドガイドライン v2.1 の実装仕様。
> 色の定義は `packages/tokens/src/colors.ts` が Single source of truth。

---

## ブランド概要

- **コンセプトワード**: 「うちのお店、開けよう。」
- **ブランドアナロジー**: 行きつけの食料品店の、物知りな店主
- **トーン**: 丁寧語ベース・感嘆符なし・押しつけない提案

---

## カラーパレット

### プリミティブカラー（6色）

| Token | Hex | 用途 |
|---|---|---|
| `colors.espresso` | #2A1600 | ナビ背景（ダーク）・最強テキスト |
| `colors.walnut` | #633806 | サブテキスト・ボーダー・セクション見出し |
| `colors.ochre` | #EF9F27 | CTAボタン・プライマリアクセント（warningとは別物） |
| `colors.honey` | #FAC775 | セカンダリアクセント・タグ枠線・ボーダー |
| `colors.cream` | #FAEEDA | ページ背景・カード背景 |
| `colors.ivory` | #FFF8EE | サーフェス・コンポーネント背景 |

### セマンティックカラー（v2.1追加）

| Token | Hex | 用途 |
|---|---|---|
| `colors.sage` | #7A9E5A | 成功・調理済み・保存完了（color-success） |
| `colors.rust` | #B84040 | エラー・抽出失敗（color-error） |
| `colors.goldenrod` | #C8A900 | 警告・未確認フィールド（color-warning、Ochreとは別） |
| `colors.mist` | #D4B896 | 情報・ヒント（color-info） |
| `colors.complement` | #4A7B9D | Ochreの補色。バッジ・NEWラベル等の対比アクセント |

> ⚠️ **重要**: `goldenrod` と `ochre` は別物。`ochre` はCTAのみ。警告には必ず `goldenrod` を使う。

### ライト/ダーク対応

| Token | Light | Dark |
|---|---|---|
| bg-page | cream #FAEEDA | #120A00 |
| bg-surface | ivory #FFF8EE | #1E1000 |
| bg-nav | ivory #FFF8EE | espresso #2A1600 |
| bg-card | ivory #FFF8EE | #241200 |
| border | honey 50% opacity | honey 12% opacity |
| text-primary | espresso #2A1600 | cream #FAEEDA |
| text-secondary | walnut #633806 | mist #D4B896 |
| text-tertiary | mist #D4B896 | #8B6040 |

---

## タイポグラフィ

| 用途 | フォント | 使用場面 |
|---|---|---|
| 見出し・キャッチ | Klee One (400/600) | 料理名・提案文・セクションタイトル |
| 本文・UIテキスト | Noto Sans JP (300/400/500) | 説明文・ラベル・ボタン |
| 英字・数字 | Plus Jakarta Sans (400/500/600) | ロゴ・分量・時間・ステップ番号 |

---

## スペーシング

```typescript
export const spacing = {
  xs: 4,   // icon内の余白
  sm: 8,   // タグ・チップ間隔
  md: 12,  // カード内padding
  lg: 16,  // セクション間
  xl: 20,  // 画面端padding
  xxl: 28, // セクション間（大）
} as const;
```

---

## ボーダー半径

```typescript
export const radius = {
  sm:   10,  // インラインバッジ・小要素
  md:   14,  // カード（標準）
  lg:   16,  // カード（大）
  pill: 999, // タグ・ボタン・チップ
} as const;
```

---

## コンポーネント仕様

### RecipeCard
```
┌────────────────────────┐
│  [サムネイル: 60%]      │  ← 料理写真（またはemoji placeholder）
│                        │  ← 右上: ブックマークボタン
│                        │  ← 左上: SNS種別バッジ（YouTube/Instagram）
├────────────────────────┤
│  料理名（Klee One）     │  ← 最大2行
│  ⏱ 20分  YouTube       │  ← タグ row
└────────────────────────┘
border-radius: radius.md (14px)
border: 0.5px honey
background: bg-card
```

Props:
```typescript
interface RecipeCardProps {
  title: string;
  creatorName: string;
  cookTimeMinutes?: number;
  sourceType: 'youtube' | 'instagram';
  isSaved?: boolean;
  isUnconfirmed?: boolean;  // Phase 1状態
  onPress?: () => void;
  onSavePress?: () => void;
}
```

---

### ShopkeeperMsg（店主のひとこと）
```
┌─────────────────────────────┐
│ 冷蔵庫の鶏肉と大葉で、      │  ← Klee One 14px
│ 今夜はどうですか。          │  ← color: text-secondary
│ ─────────────────────────   │
│ 19:42 · 今夜               │  ← Plus Jakarta Sans 10px, text-tertiary
└─────────────────────────────┘
border-left: 3px honey
background: bg-surface
border-radius: radius.sm (10px)
```

---

### PhaseBanner（Phase 2処理中）
```
┌──────────────────────────────────────────┐
│  ● 材料と手順を整理しています…            │
└──────────────────────────────────────────┘
dot color: goldenrod（アニメーション pulse）
border: 1px goldenrod
background: goldenrod 9% opacity
text color: #6B5800 (light) / #d4b840 (dark)
```

---

### Tag（汎用）

```typescript
type TagVariant = 'time' | 'source' | 'saved' | 'unconfirmed' | 'confirmed' | 'new';
```

| Variant | Background | Border | Text color |
|---|---|---|---|
| time | bg-page | honey | text-secondary |
| source | bg-page | mist | text-tertiary |
| saved | ochre 10% | ochre | text-secondary |
| unconfirmed | goldenrod 10% | goldenrod | #6B5800 |
| confirmed | sage 12% | sage | sage |
| new | complement 12% | complement | complement |

---

### BottomTabBar

| State | Icon color | Label color |
|---|---|---|
| Active | ochre | ochre |
| Inactive | text-nav-inactive | text-nav-inactive |

`text-nav-inactive`: Light = walnut 40% / Dark = cream 35%

---

### NavigationBar（iOS スタイル）

- 左: タブ名（Klee One 26px bold）
- 右: アクションアイコン（通知ベルなど）
- background: bg-nav
- border: なし（v4で廃止）

---

## UIコピーの原則

### やること
- 丁寧語ベース（〜しませんか、〜いかがですか）
- 静かで温かいトーン
- 店主が「一言添える」感覚

### やってはいけないこと
- 感嘆符（！）の使用 → **絶対禁止**
- 「すごい！」「やったね！」などの過剰な賞賛
- 「AIが自動生成」などの機能説明的なコピー
- 連続記録バッジ・ストリーク通知

### UXコピー例（.cursorrules と同一）

| 場面 | コピー |
|---|---|
| 今日の提案 | 「冷蔵庫の鶏肉と大葉で、今夜はどうですか。」 |
| 保存完了 | 「レシピを棚においておきました。」 |
| Phase 2完了通知 | 「材料と手順が整理されました。」 |
| 調理完了 | 「できあがりました。お疲れさまでした。」 |
| 空の状態 | 「まだ棚が空です。SNSで見つけたレシピを、ここに並べてみませんか。」 |
| エラー | 「うまく保存できませんでした。もう一度試してみてください。」 |

---

## Storybook 運用

### Story ファイルの命名
```
packages/ui/src/stories/
├── tokens/
│   ├── Colors.stories.tsx
│   └── Typography.stories.tsx
├── primitives/
│   ├── Button.stories.tsx
│   ├── Tag.stories.tsx
│   └── Badge.stories.tsx
└── components/
    ├── RecipeCard.stories.tsx
    ├── ShopkeeperMsg.stories.tsx
    ├── PhaseBanner.stories.tsx
    └── CollectionCard.stories.tsx
```

### 各Storyに必須のもの
1. Default（ライトモード標準状態）
2. Dark（ダークモード）
3. 各Propsのバリエーション（isSaved / isUnconfirmed / variant など）
4. インタラクティブなPropsはcontrolsで操作できるようにする
