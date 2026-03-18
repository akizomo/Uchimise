# Cursor タスク: API → Mobile 接続

## 概要

モバイルアプリの各タブ画面に埋め込まれている静的データを、実際のAPIコール（TanStack Query）に置き換える。

---

## 前提知識

- API は `apps/api/src/routes/` に Hono で実装済み
- モバイルは `apps/mobile/app/(tabs)/` に Expo Router で実装済み
- TanStack Query の `useQuery` / `useInfiniteQuery` パターンは `apps/mobile/src/hooks/useFeed.ts` を参照
- Supabase セッションから Bearer トークンを取得する方法: `supabase.auth.getSession()` → `session.access_token`
- API ベース URL: `process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'`

---

## タスク 1: API クライアント共通関数を作成

**ファイル**: `apps/mobile/src/lib/apiClient.ts`（新規作成）

```typescript
// Supabase セッションのトークンを自動付与する fetch ラッパー
// 全 API フックからこれを使う

import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}
```

---

## タスク 2: レシピ一覧フック

**ファイル**: `apps/mobile/src/hooks/useRecipes.ts`（新規作成）

- `GET /api/recipes` を叩く `useRecipes()` フックを作成
- 型は `apps/api/src/types/index.ts` の `Recipe` を参照
- `queryKey: ['recipes']`
- `apiFetch` を使うこと

---

## タスク 3: 献立タブを実API接続に切り替え

**ファイル**: `apps/mobile/app/(tabs)/plan.tsx`（既存ファイルを編集）

- `STATIC_RECIPES` 配列を削除
- `useRecipes()` フックを使うように変更
- データ取得中は `ActivityIndicator` を表示（`colors.ochre` 色）
- エラー時は「うまく読み込めませんでした。画面を引っ張って更新してください。」を表示
- `ScrollView` に `refreshControl` を追加（pull-to-refresh で `refetch`）

---

## タスク 4: 自分タブに調理記録を表示

**ファイル**: `apps/mobile/src/hooks/useCookingRecords.ts`（新規作成）

- `GET /api/cooking-records` を叩くフックを作成

**ファイル**: `apps/mobile/app/(tabs)/me.tsx`（既存ファイルを編集）

- `useCookingRecords()` を使って調理記録一覧を表示
- 各レコードは `RecipeCard` コンポーネントで表示（`isSaved: true`）
- 空の場合は既存の EmptyState をそのまま使う

---

## 守るべきルール

- 色は必ず `@uchimise/tokens` の定数を使う（ハードコード禁止）
- UIコピーに感嘆符（！）を使わない
- `elevation` / `shadowColor` を使わない
- ローディング中の高さは既存カードと同じ程度にして、レイアウトがガタつかないようにする
- `any` 型を使わない — 型が不明な場合は `unknown` を使って絞る
