import React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../hooks/useTheme';

// ── Size scale ─────────────────────────────────────────────────────────────────
export const ICON_SIZE = {
  sm: 18,
  md: 24,
  lg: 28,
} as const;

export type IconSize = keyof typeof ICON_SIZE;

// ── Color roles ────────────────────────────────────────────────────────────────
// Semantic roles that make sense for icons.
// Passing a literal hex is also accepted for one-off overrides.
export type IconColor =
  | 'primary'      // theme.iconPrimary   — default
  | 'secondary'    // theme.iconSecondary
  | 'tertiary'     // theme.iconTertiary
  | 'tint'         // theme.iconTint      — CTA / active
  | 'positive'     // theme.positive
  | 'negative'     // theme.negative
  | 'warning'      // theme.warning
  | 'accent'       // theme.accent
  | (string & {});  // literal hex fallback

function resolveColor(color: IconColor, theme: Theme): string {
  switch (color) {
    case 'primary':   return theme.iconPrimary;
    case 'secondary': return theme.iconSecondary;
    case 'tertiary':  return theme.iconTertiary;
    case 'tint':      return theme.iconTint;
    case 'positive':  return theme.positive;
    case 'negative':  return theme.negative;
    case 'warning':   return theme.warning;
    case 'accent':    return theme.accent;
    default:          return color;
  }
}

// ── Icon component ─────────────────────────────────────────────────────────────

export interface IconProps {
  /** Any lucide-react-native icon component */
  as: LucideIcon;
  size?: IconSize | number;
  color?: IconColor;
  strokeWidth?: number;
}

/**
 * Themed icon wrapper.
 *
 * Usage:
 *   import { Bookmark } from 'lucide-react-native';
 *   <Icon as={Bookmark} size="md" color="tint" />
 */
export function Icon({
  as: LucideIcon,
  size = 'md',
  color = 'primary',
  strokeWidth = 1.5,
}: IconProps) {
  const theme     = useTheme();
  const resolvedColor = resolveColor(color, theme);
  const resolvedSize  = typeof size === 'number' ? size : ICON_SIZE[size];

  return (
    <LucideIcon
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
    />
  );
}
