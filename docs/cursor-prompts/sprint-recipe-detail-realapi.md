# Cursor Task — Recipe Detail Screen: Real API + Cooking Record

## Context
Monorepo: `pnpm` workspaces + Turborepo.
Target: `apps/mobile/` (React Native + Expo 52, Expo Router v4).
Design tokens: `@uchimise/tokens`. Theme: `useTheme()` from `@uchimise/ui`.
API client: `apps/mobile/src/lib/apiClient.ts` — `apiFetch<T>(path, init?)`.
Existing hooks:
- `apps/mobile/src/hooks/useRecipes.ts` — defines the `Recipe` type (snake_case fields)
No elevation / boxShadow. No exclamation marks in copy.

## Task
Replace the static placeholder in `app/recipe/[id].tsx` with real API data and
wire the "調理する" button to POST a cooking record.

## Constraints
- `@uchimise/tokens` constants only — no hex literals, no magic numbers
- `useTheme()` for all dynamic colors
- TypeScript strict — no `any`
- `apiFetch` from `src/lib/apiClient.ts` — do NOT call `fetch` directly
- Copy the `Recipe` type interface from `src/hooks/useRecipes.ts` — do NOT create a new package

## Expected output

### 1. `apps/mobile/src/hooks/useRecipe.ts`
Single-recipe query:
```typescript
interface RecipeDetail {
  id: string;
  title: string;
  source_url: string;
  source_type: 'youtube' | 'instagram';
  creator_name: string | null;
  thumbnail_url: string | null;
  cook_time_minutes: number | null;
  extraction_status: 'pending' | 'done' | 'failed';
  ingredients: Array<{ name: string; amount?: string; unit?: string; isSubstituted: boolean }>;
  steps: Array<{ order: number; text: string }>;
  tags: string[];
}

export function useRecipe(id: string): UseQueryResult<RecipeDetail>
// queryKey: ['recipes', id]
// endpoint: GET /api/recipes/:id
```

### 2. `apps/mobile/src/hooks/useCreateCookingRecord.ts`
```typescript
export function useCreateCookingRecord(): UseMutationResult<void, Error, { recipeId: string; note?: string }>
// endpoint: POST /api/cooking-records  body: { recipe_id, note }
// on success: invalidate ['cooking-records']
```

### 3. Update `app/recipe/[id].tsx`
Replace static `STATIC_RECIPE` with real data:

```tsx
const { id } = useLocalSearchParams<{ id: string }>();
const { data: recipe, isLoading, isError } = useRecipe(id);
const { mutate: createRecord, isPending: isRecording } = useCreateCookingRecord();

function handleCook() {
  if (!recipe) return;
  createRecord(
    { recipeId: recipe.id },
    { onSuccess: () => router.back() }
  );
}
```

Loading state: show `RecipeDetailSkeleton` if it exists in
`src/components/common/skeletons/`, otherwise `ActivityIndicator`.

Error state:
```tsx
<Text style={{ color: theme.textTertiary }}>
  うまく読み込めませんでした。時間をおいてからもう一度お試しください。
</Text>
```

"調理する" button:
- `onPress={handleCook}`
- `disabled={isRecording}`
- While recording: show `ActivityIndicator size="small" color={colors.ivory}` inside button

### 4. Display thumbnail if available
Add above the ingredients section:
```tsx
{recipe.thumbnail_url && (
  <Image
    source={{ uri: recipe.thumbnail_url }}
    style={{ width: '100%', height: 200, borderRadius: radius.md }}
    resizeMode="cover"
  />
)}
```

### 5. Display tags row
Between meta and ingredients:
```tsx
{recipe.tags.length > 0 && (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
    {recipe.tags.map((tag) => <Tag key={tag} label={tag} variant="time" />)}
  </View>
)}
```
Import `Tag` from `@uchimise/ui`.
