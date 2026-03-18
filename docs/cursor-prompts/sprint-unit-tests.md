# Cursor Task — Unit Tests: roughExtractor & normalizer

## Context
Monorepo: `pnpm` workspaces + Turborepo.
Target: `apps/api/` (Node.js + Hono, TypeScript strict).
Test runner: Jest + ts-jest (config in `apps/api/jest.config.ts`).
Run tests: `pnpm --filter @uchimise/api test`

Files under test:
- `apps/api/src/services/phase1/roughExtractor.ts` — `roughExtract(text: string): RoughExtractionResult`
- `apps/api/src/services/phase2/normalizer.ts` — `normalizeRecipe(raw: StructuredRecipe): NormalizedRecipe`

No mocking needed — both functions are pure with no I/O.

## Task
Write comprehensive unit test suites for `roughExtractor` and `normalizer`.

## Constraints
- Jest + `@jest/globals` (`describe`, `it`, `expect`) — no `test()` shorthand
- No `any` — use the exported types directly
- Table-driven tests where there are multiple similar cases
- Each `it()` description must be in Japanese (it reads as a spec doc)
- Cover happy path, edge cases, and boundary conditions listed below

## Expected output

### 1. `apps/api/src/services/phase1/__tests__/roughExtractor.test.ts`

Cases to cover:
```
ingredientSection extraction
  ✓ 【材料】セクションから材料名を抽出する
  ✓ ■材料 セクション（全角スペース）から材料名を抽出する
  ✓ 材料（2人分）形式から材料名を抽出する
  ✓ セクションなしのテキストでは hasIngredientSection が false になる
  ✓ 空文字列では空配列と hasIngredientSection=false を返す

ingredientLine parsing
  ✓ ・印の行から品名を取り出す（分量を含む行）
  ✓ 数値＋単位を除いた品名だけを返す（鶏もも肉300g → 鶏もも肉）
  ✓ 2文字未満の品名は無視する
  ✓ 重複する材料名は1件にまとめる

cookTime extraction
  ✓ "30分で完成" から 30 を返す
  ✓ "調理時間：45分" から 45 を返す
  ✓ 481分以上の値は返さない（異常値除外）
  ✓ 調理時間の記載がない場合は undefined を返す
```

Representative fixture (copy into test file as-is):
```typescript
const FIXTURE_YOUTUBE_DESC = `
簡単おいしい！鶏もも肉と大葉のさっぱり炒め
30分で完成する時短レシピです。

【材料（2人分）】
・鶏もも肉 300g
・大葉 10枚
・醤油 大さじ2
・みりん 大さじ1
・ごま油 小さじ1

【手順】
1. 鶏肉を一口大に切る
2. フライパンで炒める
`;
```

### 2. `apps/api/src/services/phase2/__tests__/normalizer.test.ts`

Cases to cover:
```
normalizeRecipe — happy path
  ✓ 全フィールドが揃ったStructuredRecipeを正規化できる
  ✓ ingredients の amount/unit が結果に保持される
  ✓ steps が order 昇順にソートされる
  ✓ 無効なタグ（非文字列）はフィルタされる

confidenceScore & isUnconfirmed
  ✓ 全confidence=1.0 の場合 confidenceScore=1.0, isUnconfirmed=false
  ✓ 平均confidence=0.79 の場合 isUnconfirmed=true
  ✓ 平均confidence=0.80 の場合 isUnconfirmed=false（境界値）
  ✓ ingredients が空の場合 confidenceScore=0, isUnconfirmed=true

validation
  ✓ name が空文字の ingredient は除外される
  ✓ order が負の step は除外される
  ✓ isSubstituted は常に false で初期化される
```

Representative fixture:
```typescript
const VALID_RAW: StructuredRecipe = {
  ingredients: [
    { name: '鶏もも肉', amount: '300', unit: 'g', confidence: 1.0 },
    { name: '大葉',     amount: '10',  unit: '枚', confidence: 0.9 },
  ],
  steps: [
    { order: 2, text: 'フライパンで炒める' },
    { order: 1, text: '鶏肉を切る' },
  ],
  tags: ['時短', '作り置き'],
  cookTimeMinutes: 30,
};
```
