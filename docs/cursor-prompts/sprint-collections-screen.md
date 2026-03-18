# Cursor Task — Collections Screen

## Context
Monorepo: `pnpm` workspaces + Turborepo.
Target: `apps/mobile/` (React Native + Expo 52, Expo Router v4).
Design tokens: `@uchimise/tokens`. Theme: `useTheme()` from `@uchimise/ui`.
API client: `apps/mobile/src/lib/apiClient.ts` — `apiFetch<T>(path, init?)`.
Existing components in `@uchimise/ui`: `RecipeCard`, `NavigationBar`, `Tag`, `useTheme`.
No elevation / boxShadow. No exclamation marks in copy.

## Task
Add a Collections tab to the `(tabs)` group and implement the full CRUD UI.

## Constraints
- `@uchimise/tokens` constants only — no hex literals, no magic numbers
- `useTheme()` for all dynamic colors
- TanStack Query (`@tanstack/react-query`) for data fetching
- TypeScript strict — no `any`
- `apiFetch` from `src/lib/apiClient.ts` — do NOT call `fetch` directly

## Expected output

### 1. `apps/mobile/src/hooks/useCollections.ts`
TanStack Query hooks:
```typescript
interface Collection {
  id: string;
  name: string;
  recipe_count: number;
  created_at: string;
}
interface CollectionDetail extends Collection {
  recipes: Array<{
    id: string;
    title: string;
    thumbnail_url: string | null;
    source_type: 'youtube' | 'instagram';
    cook_time_minutes: number | null;
    creator_name: string | null;
  }>;
}

export function useCollections(): UseQueryResult<Collection[]>
export function useCollection(id: string): UseQueryResult<CollectionDetail>
export function useCreateCollection(): UseMutationResult<Collection, Error, { name: string }>
export function useDeleteCollection(): UseMutationResult<void, Error, string>
```
Endpoints: `GET /api/collections`, `GET /api/collections/:id`,
`POST /api/collections`, `DELETE /api/collections/:id`.
On mutation success: invalidate `['collections']`.

### 2. `apps/mobile/app/(tabs)/collections.tsx`
Full screen with:
- `NavigationBar title="コレクション"`
- Loading: `ActivityIndicator` (or SkeletonBox if it exists in `src/components/common/`)
- Empty state: centered 📚 emoji + "コレクションはまだありません" + 作成ボタン
- List: vertical `ScrollView` with `CollectionCard` rows
- FAB (floating action button) at bottom-right — `+` icon, `colors.ochre` background — opens create modal

### 3. `apps/mobile/src/components/plan/CollectionCard.tsx`
Props:
```typescript
interface CollectionCardProps {
  name: string;
  recipeCount: number;
  onPress?: () => void;
  onDelete?: () => void;
}
```
Layout: full-width row with `borderBottomWidth: 0.5, borderBottomColor: theme.border`.
Left: collection name (KleeOne 16px). Right: `{recipeCount}品` + chevron (`›`).
Long-press → confirm delete (use `Alert.alert`).
No boxShadow.

### 4. `apps/mobile/app/collection/[id].tsx`
Collection detail screen (`presentation: 'card'`):
- Header with `‹ 戻る` and collection name
- RecipeCard grid from `@uchimise/ui`
- On RecipeCard press → `router.push(\`/recipe/${recipe.id}\`)`
- Empty state: "まだレシピがありません"

### 5. Register in `apps/mobile/app/_layout.tsx`
Add `<Stack.Screen name="collection/[id]" options={{ presentation: 'card' }} />`

### 6. Register in `apps/mobile/app/(tabs)/_layout.tsx`
Add collections tab. Icon: use `@expo/vector-icons` Ionicons `"albums-outline"` / `"albums"`.
Tab order: 献立 / 発見 / コレクション / 自分

## Token reference
```typescript
import { colors, spacing, radius, fontFamily, fontSize } from '@uchimise/tokens';
```
