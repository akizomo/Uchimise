/**
 * Animation duration tokens (ms)
 * コンポーネント内の timing 値をここに統一する。
 */
export const duration = {
  instant: 100,  // マイクロインタラクション（チェックボックス・アイコン切替）
  fast:    180,  // ボタンフィードバック・Toast 表示
  normal:  250,  // モーダル・BottomSheet スライド
  slow:    350,  // ページ遷移
} as const;

/**
 * Spring animation presets for Animated.spring
 * useNativeDriver: true 前提
 */
export const spring = {
  /** ボタン押下の沈み込み */
  snappy: { damping: 20, stiffness: 500, mass: 1 },
  /** ボタン・カードのバウンスバック */
  bouncy: { damping: 15, stiffness: 300, mass: 1 },
  /** BottomSheet のスライドイン */
  sheet:  { damping: 26, stiffness: 200, mass: 1 },
  /** AlertDialog のスケールイン */
  dialog: { damping: 22, stiffness: 300, mass: 1 },
  /** SegmentedControl / Chip — ほぼバウンスなし */
  gentle: { damping: 40, stiffness: 400, mass: 1 },
  /** SearchBar キャンセルボタン */
  cancel: { damping: 20, stiffness: 280, mass: 1 },
} as const;

/**
 * Easing curve parameters (cubic-bezier) — platform-agnostic な数値のみ。
 * コンポーネントでは packages/ui/src/motion.ts の easing オブジェクトを使うこと。
 *
 * 参考: https://m3.material.io/styles/motion/easing-and-duration
 */
export const easingParams = {
  /** 汎用。スライド・フェード */
  standard:   [0.2, 0.0, 0.0, 1.0] as const,
  /** インアニメ — 画面・モーダル */
  decelerate: [0.0, 0.0, 0.2, 1.0] as const,
  /** アウトアニメ — 画面・モーダル */
  accelerate: [0.4, 0.0, 1.0, 1.0] as const,
  /** 大きな移動 — BottomSheet・FAB */
  emphasized: [0.2, 0.0, 0.0, 1.0] as const,
} as const;

/**
 * Named transition presets — duration と easing の組み合わせを 1セットで管理。
 * packages/ui の makeTimingConfig() と組み合わせて使う。
 *
 * @example
 * Animated.timing(val, { ...makeTimingConfig('sheetIn'), useNativeDriver: true })
 */
export const transition = {
  /** 画面プッシュ（右→左スライド） */
  screenPush: { duration: duration.slow,    easing: 'decelerate' as const },
  /** モーダル スライドアップ */
  modalIn:    { duration: duration.normal,  easing: 'decelerate' as const },
  /** モーダル スライドダウン */
  modalOut:   { duration: duration.fast,    easing: 'accelerate' as const },
  /** BottomSheet スライドイン */
  sheetIn:    { duration: duration.normal,  easing: 'emphasized' as const },
  /** BottomSheet スライドアウト */
  sheetOut:   { duration: 230,              easing: 'accelerate' as const },
  /** フェードイン（Toast・オーバーレイ） */
  fadeIn:     { duration: duration.fast,    easing: 'decelerate' as const },
  /** フェードアウト */
  fadeOut:    { duration: duration.fast,    easing: 'accelerate' as const },
  /** マイクロインタラクション */
  micro:      { duration: duration.instant, easing: 'standard'  as const },
} as const;

export type DurationToken    = keyof typeof duration;
export type SpringPreset     = keyof typeof spring;
export type EasingPreset     = keyof typeof easingParams;
export type TransitionPreset = keyof typeof transition;
