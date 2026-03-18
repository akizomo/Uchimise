import { amber, complement, goldenrod, neutral, rust, sage, surface } from './primitive';

/**
 * @deprecated
 * コンポーネントで直接参照せず、primitive スケールまたは useTheme() を使用すること。
 * 既存コンポーネントとの後方互換のためのみ残存。
 *
 * 対応表:
 *   espresso   → amber[900]     walnut   → amber[800]   ochre    → amber[500]
 *   honey      → amber[300]     cream    → amber[200]   ivory    → amber[50]
 *   sage       → sage[600]      rust     → rust[600]    goldenrod → goldenrod[500]
 *   mist       → neutral[400]   complement → complement[600]
 *   dark1      → surface[0]     darkElevated → surface[4]
 */
export const colors = {
  // Amber family
  espresso:  amber[900],
  walnut:    amber[800],
  ochre:     amber[500],
  honey:     amber[300],
  cream:     amber[200],
  ivory:     amber[50],
  linen:     amber[100],
  caramel:   amber[400],
  ochreDark: amber[600],
  ochreDeep: amber[700],

  // Sage
  sage:    sage[600],
  sageMid: sage[400],
  sageBg:  sage[100],

  // Rust
  rust:    rust[600],
  rustMid: rust[400],
  rustBg:  rust[100],

  // Goldenrod
  goldenrod:     goldenrod[500],
  goldenrodMid:  goldenrod[400],
  goldenrodBg:   goldenrod[100],
  goldenrodText: goldenrod[700],

  // Neutral (旧 mist)
  mist:     neutral[400],
  mistDark: neutral[600],
  mistDeep: neutral[800],

  // Complement
  complement:    complement[600],
  complementMid: complement[400],
  complementBg:  complement[100],

  // Dark mode surfaces
  dark1:        surface[0],
  dark2:        surface[1],
  dark3:        surface[3],
  darkCard:     surface[2],
  darkElevated: surface[4],

  // Absolute
  white: neutral[0],
  black: neutral[1000],
} as const;

export type ColorToken = keyof typeof colors;
