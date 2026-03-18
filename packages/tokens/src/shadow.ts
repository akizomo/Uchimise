import { colors } from './colors';

/**
 * Shadow tokens for React Native (iOS primary)
 *
 * ⚠️  NOT FOR USE IN COMPONENTS
 * Uchimise はフラットデザイン原則 (cursorrules) のため、
 * コンポーネント内で shadow.* を使うことを禁止する。
 * 代わりに elevation.ts のルールに従うこと:
 *   - elevated 要素 (Toast/AlertDialog) → borderWidth: 1, borderColor: separatorOpaque
 *   - BottomSheet → borderTopWidth: 1, borderTopColor: separatorOpaque
 */
export const shadow = {
  sm: {
    shadowColor: colors.espresso,
    shadowOffset: { width: 0, height: 1 } as const,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.espresso,
    shadowOffset: { width: 0, height: 2 } as const,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.espresso,
    shadowOffset: { width: 0, height: 6 } as const,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  /** Used for sheets/modals — casts upward */
  sheet: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 } as const,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export type ShadowToken = keyof typeof shadow;
