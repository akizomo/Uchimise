import { useColorScheme } from 'react-native';

import { semantic } from '@uchimise/tokens';

import { useThemeContext } from '../context/ThemeContext';

/**
 * Layer 3: Component Tokens
 * Wraps iOS HIG semantic tokens with light/dark auto-switching.
 * Supports ThemeContext override (used by Storybook decorator).
 */
export interface Theme {
  isDark: boolean;

  // ── Labels ──────────────────────────────────────────────────────────────
  label: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
  labelPlaceholder: string;

  // ── Icons ────────────────────────────────────────────────────────────────
  iconPrimary: string;
  iconSecondary: string;
  iconTertiary: string;
  iconTint: string;

  // ── Fills ────────────────────────────────────────────────────────────────
  fillPrimary: string;
  fillSecondary: string;
  fillTertiary: string;
  fillQuaternary: string;
  fillTint: string;

  // ── Backgrounds ──────────────────────────────────────────────────────────
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgGrouped: string;
  bgGroupedSecondary: string;
  bgNav: string;
  bgElevated: string;

  // ── Separators ───────────────────────────────────────────────────────────
  separator: string;
  separatorOpaque: string;

  // ── Accent / CTA ─────────────────────────────────────────────────────────
  tint: string;
  tintPressed: string;
  tintSubtle: string;

  // ── Status: Positive ─────────────────────────────────────────────────────
  positive: string;
  positiveBg: string;
  positiveBorder: string;

  // ── Status: Negative ─────────────────────────────────────────────────────
  negative: string;
  negativeBg: string;
  negativeBorder: string;

  // ── Status: Warning ──────────────────────────────────────────────────────
  warning: string;
  warningBg: string;
  warningBorder: string;
  warningText: string;

  // ── Status: Accent ───────────────────────────────────────────────────────
  accent: string;
  accentBg: string;
  accentBorder: string;

  // ── Link ─────────────────────────────────────────────────────────────────
  link: string;

  // ── Navigation ───────────────────────────────────────────────────────────
  navIconActive: string;
  navIconInactive: string;
  navLabelActive: string;
  navLabelInactive: string;

  // ── Overlay ──────────────────────────────────────────────────────────────
  scrim: string;

  // ── Legacy aliases (backward compatibility) ───────────────────────────────
  bgPage: string;
  bgSurface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
}

export function useTheme(): Theme {
  const ctx = useThemeContext();
  const scheme = useColorScheme();
  const isDark = ctx !== null ? ctx.isDark : scheme === 'dark';

  const s = isDark ? semantic.dark : semantic.light;

  return {
    isDark,
    // All semantic roles
    ...s,
    // Legacy aliases
    bgPage:        s.bgPrimary,
    bgSurface:     s.bgSecondary,
    border:        s.separator,
    textPrimary:   s.label,
    textSecondary: s.labelSecondary,
    textTertiary:  s.labelTertiary,
  };
}
