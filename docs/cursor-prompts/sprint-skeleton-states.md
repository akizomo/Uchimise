# Cursor Task — Loading / Error Skeleton States

## Context
Monorepo: `pnpm` workspaces + Turborepo.
Target: `apps/mobile/` (React Native + Expo 52, Expo Router v4).
Design tokens: `@uchimise/tokens` (colors, spacing, radius, fontFamily, fontSize).
Theme hook: `useTheme()` from `@uchimise/ui` — use for ALL dynamic colors.
No elevation / boxShadow. No exclamation marks in copy.

Screens that currently show raw `ActivityIndicator` with no skeleton:
- `app/(tabs)/plan.tsx`
- `app/(tabs)/discover.tsx`
- `app/(tabs)/me.tsx`
- `app/recipe/[id].tsx`

## Task
Create a reusable `SkeletonBox` primitive and per-screen skeleton layouts,
then wire them into each screen's loading branch.

## Constraints
- Only `@uchimise/tokens` constants — no hex literals, no magic numbers
- `useTheme()` for skeleton shimmer background color
- Shimmer animation: `Animated.loop` + `Animated.timing` (opacity 0.4 → 0.9, 900ms)
- TypeScript strict — no `any`
- No new packages — use `react-native` Animated API only

## Expected output

### 1. `apps/mobile/src/components/common/SkeletonBox.tsx`
Props: `width: number | string`, `height: number`, `borderRadius?: number`
Exports: `SkeletonBox`
Animation: shimmer opacity loop on mount, stops on unmount

### 2. `apps/mobile/src/components/common/skeletons/PlanSkeleton.tsx`
Layout mirrors `plan.tsx`:
- WeekCalendar placeholder row (full width, height 72)
- SegmentControl placeholder (full width, height 36)
- 3× RecipeCard placeholders (full width, height 96)

### 3. `apps/mobile/src/components/common/skeletons/DiscoverSkeleton.tsx`
Layout mirrors `discover.tsx`:
- Horizontal tag row: 5× pill placeholders (width 80, height 28)
- 3× RecipeCard placeholders (full width, height 96)

### 4. `apps/mobile/src/components/common/skeletons/MeSkeleton.tsx`
Layout mirrors `me.tsx`:
- 4× RecipeCard placeholders (full width, height 80)

### 5. `apps/mobile/src/components/common/skeletons/RecipeDetailSkeleton.tsx`
Layout mirrors `recipe/[id].tsx`:
- Title block (width 80%, height 24)
- Meta row (width 50%, height 16)
- Ingredients card placeholder (full width, height 200)
- 3× step row placeholders

### 6. Wire into each screen
Replace `isLoading` branches:
```tsx
// Before
{isLoading && <ActivityIndicator />}

// After
{isLoading && <PlanSkeleton />}
```

### 7. Barrel export
`apps/mobile/src/components/common/index.ts` — re-export SkeletonBox and all skeletons

## Token reference
```typescript
import { colors, spacing, radius } from '@uchimise/tokens';
import { useTheme } from '@uchimise/ui';

// Skeleton background
const theme = useTheme();
// light: theme.bgSurface  dark: also theme.bgSurface — already handles both
```
