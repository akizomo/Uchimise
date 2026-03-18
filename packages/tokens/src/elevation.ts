/**
 * Elevation System — Uchimise Flat Design
 *
 * ルール: shadow (box-shadow / elevation) は使わない。
 * 代わりに「背景色のステップ」「ボーダー」「scrim」の組み合わせで層を表現する。
 *
 * ─────────────────────────────────────────────────────────────
 *  Layer  │ Light bg    │ Dark bg      │ 境界の表現
 * ─────────────────────────────────────────────────────────────
 *    0    │ cream       │ dark1        │ なし（ページ地）
 *    1    │ ivory       │ dark2        │ 0.5px separator ボーダー
 *    2    │ ivory       │ darkCard     │ 0.5px separator ボーダー
 *    3    │ white       │ darkElevated │ 1px separatorOpaque + scrim
 * ─────────────────────────────────────────────────────────────
 *
 * 使い分けガイド
 * ─────────────────────────────────────────────────────────────
 * page (0)      bgPrimary    ページ背景。他の要素はここに乗る
 * surface (1)   bgSecondary  カード・リスト行・入力欄の背景
 * card (2)      bgCard       RecipeCard・CollectionCard 等
 * elevated (3)  bgElevated   BottomSheet・AlertDialog・Toast
 *               ※ elevated 要素は scrim で文脈を与えること
 * ─────────────────────────────────────────────────────────────
 *
 * ボーダーのルール
 *   surface/card → borderWidth: 0.5,  borderColor: separator
 *   elevated     → borderWidth: 1,    borderColor: separatorOpaque
 *   BottomSheet  → borderTopWidth: 1, borderTopColor: separatorOpaque
 */
export const elevationLayer = {
  page:     0,
  surface:  1,
  card:     2,
  elevated: 3,
} as const;

export type ElevationLayer = keyof typeof elevationLayer;
