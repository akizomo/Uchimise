export const fontFamily = {
  // 見出し・店主メッセージ・カードタイトル
  heading: 'KleeOne',
  // 本文・UIラベル・説明文
  body: 'NotoSansJP',
  // ロゴ・数字・分量（英数字専用）
  display: 'PlusJakartaSans',
} as const;

export const fontWeight = {
  light:    '300',
  regular:  '400',
  medium:   '500',
  semibold: '600',
} as const;

export const fontSize = {
  xs:  10,
  sm:  12,
  md:  14,
  lg:  16,
  xl:  18,
  xxl: 20,
  h2:  22,
  h1:  26,
} as const;

/**
 * lineHeight multipliers
 * React Native では絶対値(px)が必要なため、calcLineHeight() を使うこと。
 * コンポーネント内で `fontSize.md * 1.6` のようなインライン計算を書かない。
 */
export const lineHeight = {
  tight:   1.2,  // 数値・バッジ・密なUI
  snug:    1.4,  // カードタイトル・短い本文
  normal:  1.5,  // 標準本文
  relaxed: 1.6,  // 説明文・長文
  loose:   1.8,  // 余白を多くとる場合（ほぼ未使用）
} as const;

/**
 * 絶対値(px)の lineHeight を返すユーティリティ。
 * @example
 * lineHeight: calcLineHeight(fontSize.md, 'relaxed')  // 14 * 1.6 = 22.4 → 22
 */
export function calcLineHeight(
  size: number,
  key: keyof typeof lineHeight = 'normal',
): number {
  return Math.round(size * lineHeight[key]);
}

/**
 * Named text style presets — fontFamily / fontSize / lineHeight を 1セットで管理。
 * コンポーネントでは textStyle.body のように参照し、color は useTheme() で上書きする。
 *
 * @example
 * <Text style={[textStyle.body, { color: theme.label }]}>...</Text>
 */
export const textStyle = {
  // ── Display / Hero ────────────────────────────────────────────────────────
  h1:      { fontFamily: fontFamily.heading, fontSize: fontSize.h1,  lineHeight: calcLineHeight(fontSize.h1,  'snug') },
  h2:      { fontFamily: fontFamily.heading, fontSize: fontSize.h2,  lineHeight: calcLineHeight(fontSize.h2,  'snug') },

  // ── Section / Sheet ヘッダー ───────────────────────────────────────────────
  title:   { fontFamily: fontFamily.heading, fontSize: fontSize.xl,  lineHeight: calcLineHeight(fontSize.xl,  'snug') },
  titleSm: { fontFamily: fontFamily.heading, fontSize: fontSize.lg,  lineHeight: calcLineHeight(fontSize.lg,  'snug') },

  // ── 本文 ─────────────────────────────────────────────────────────────────
  bodyLg:  { fontFamily: fontFamily.body,    fontSize: fontSize.lg,  lineHeight: calcLineHeight(fontSize.lg,  'normal') },
  body:    { fontFamily: fontFamily.body,    fontSize: fontSize.md,  lineHeight: calcLineHeight(fontSize.md,  'normal') },
  bodySm:  { fontFamily: fontFamily.body,    fontSize: fontSize.sm,  lineHeight: calcLineHeight(fontSize.sm,  'normal') },

  // ── UI ラベル（tight leading） ─────────────────────────────────────────────
  label:   { fontFamily: fontFamily.body,    fontSize: fontSize.md,  lineHeight: calcLineHeight(fontSize.md,  'tight') },
  labelSm: { fontFamily: fontFamily.body,    fontSize: fontSize.sm,  lineHeight: calcLineHeight(fontSize.sm,  'tight') },

  // ── タグ・バッジ・マイクロ ──────────────────────────────────────────────────
  micro:   { fontFamily: fontFamily.body,    fontSize: fontSize.xs,  lineHeight: calcLineHeight(fontSize.xs,  'normal') },

  // ── 数値表示（調理時間・分量 — PlusJakartaSans） ────────────────────────────
  numLg:   { fontFamily: fontFamily.display, fontSize: fontSize.xxl, lineHeight: calcLineHeight(fontSize.xxl, 'tight') },
  num:     { fontFamily: fontFamily.display, fontSize: fontSize.xl,  lineHeight: calcLineHeight(fontSize.xl,  'tight') },
  numSm:   { fontFamily: fontFamily.display, fontSize: fontSize.lg,  lineHeight: calcLineHeight(fontSize.lg,  'tight') },
} as const;

export type FontFamilyToken  = keyof typeof fontFamily;
export type FontWeightToken  = keyof typeof fontWeight;
export type FontSizeToken    = keyof typeof fontSize;
export type LineHeightToken  = keyof typeof lineHeight;
export type TextStyleToken   = keyof typeof textStyle;
