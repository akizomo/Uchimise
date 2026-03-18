/**
 * Layer 1: Primitive Color Tokens
 *
 * ルール:
 *  - 各ファミリーは 50–900 の連続スケールを持つ
 *  - 数字が大きいほど暗い（Spectrum / Tailwind 準拠）
 *  - セマンティックな意味を持たない純粋な色値
 *  - コンポーネントから直接参照禁止。semantic.ts 経由のみ。
 *
 * ステップ別の用途ガイド（Spectrum Color System 準拠）:
 *   50–200   Background tints     薄い色面、タグ・バナー背景
 *   300–400  Borders / subtle     区切り線、軽い装飾
 *   500–600  Icons / dark-mode    アイコン・ダークモードのテキスト
 *   700–800  Text (AA on white)   ライトモードのテキスト（WCAG AA 4.5:1 以上）
 *   900      Solid fill           白テキストを乗せるソリッド塗り
 */

// ── Amber ─────────────────────────────────────────────────────────────────────
// メインブランドスケール。背景（50-200）→ CTA・アクセント（400-700）→ テキスト（800-900）
export const amber = {
  50:  '#FFF8EE',  // ivory      surface background
  100: '#FFF3DC',  // linen      subtle highlight
  200: '#FAEEDA',  // cream      page background
  300: '#FAC775',  // honey      divider / secondary accent
  400: '#F5B24E',  // caramel    warm mid-tone
  500: '#EF9F27',  // ochre      primary CTA
  600: '#C8780F',  // ochreDark  CTA hover / active
  700: '#A05E06',  // ochreDeep  CTA pressed
  800: '#633806',  // walnut     secondary text
  900: '#2A1600',  // espresso   primary text
} as const;

// ── Surface ───────────────────────────────────────────────────────────────────
// ダークモード専用の背景レイヤー。0 = 最深部（ページ）、4 = 最上位（elevated）
export const surface = {
  0: '#120A00',  // page bg      (darkest)
  1: '#1E1000',  // surface / nav
  2: '#241200',  // card
  3: '#2A1600',  // nav  (= amber[900])
  4: '#301A00',  // elevated  (sheet / modal)
} as const;

// ── Sage ──────────────────────────────────────────────────────────────────────
// 成功 / ポジティブ / 保存済み
export const sage = {
  50:  '#FAFCF8',
  100: '#EBF5E3',
  200: '#D5E6C5',
  300: '#BFD7A7',
  400: '#A8C88A',
  500: '#91B372',
  600: '#7A9E5A',
  700: '#5C7F42',  // 4.6:1 on white ✓ WCAG AA
  800: '#45642F',
  900: '#2E4A1C',  // solid fill — white text ✓
} as const;

// ── Rust ──────────────────────────────────────────────────────────────────────
// エラー / ネガティブ / 失敗
export const rust = {
  50:  '#FEF9F9',
  100: '#FAE6E6',
  200: '#EBBFBF',
  300: '#DB9797',
  400: '#CC7070',
  500: '#C25858',
  600: '#B84040',  // 5.4:1 on white ✓ WCAG AA
  700: '#8C2A2A',
  800: '#741E1E',
  900: '#5C1212',  // solid fill — white text ✓
} as const;

// ── Goldenrod ─────────────────────────────────────────────────────────────────
// 警告 / 未確定 / Phase 2 保留
// 注意: 黄色系は低輝度コントラストのため、テキスト用は 700 以上を使うこと
export const goldenrod = {
  50:  '#FEFDF2',
  100: '#FDF7CC',
  200: '#EFE29D',
  300: '#E1CD6E',
  400: '#D4B840',
  500: '#C8A900',
  600: '#9A7F00',
  700: '#6B5800',  // 7.0:1 on white ✓ WCAG AA
  800: '#544400',
  900: '#3E3000',  // solid fill — white text ✓
} as const;

// ── Complement ────────────────────────────────────────────────────────────────
// アクセント / NEW バッジ / インフォ — ウォームアンバーへのクールな対比色
export const complement = {
  50:  '#F5FAFD',
  100: '#D6EAF5',
  200: '#B2D0E1',
  300: '#8EB5CC',
  400: '#6A9BB8',
  500: '#5A8BAA',
  600: '#4A7B9D',  // 4.5:1 on white ✓ WCAG AA
  700: '#2D5F80',
  800: '#245274',
  900: '#1A4568',  // solid fill — white text ✓
} as const;

// ── Neutral ───────────────────────────────────────────────────────────────────
// ウォームグレースケール（Uchimise のブランドに合わせてわずかにアンバー系で色付け）
// 0 = 絶対白、1000 = 絶対黒  ／  50–900 = ウォームグレー連続スケール
// ※ 旧 mist トークンはこのスケールに統合
export const neutral = {
  0:    '#FFFFFF',  // absolute white
  50:   '#FCF8F3',  // near white, barely warm
  100:  '#F5EDE0',
  200:  '#EDD9C0',
  300:  '#E0C4A0',
  400:  '#D4B896',  // ← 旧 mist[100] / mist[300]  info hint / placeholder
  500:  '#C6A483',
  600:  '#B89070',  // ← 旧 mist[200] / mist[500]  emphasis / secondary icon
  700:  '#A17858',
  800:  '#8B6040',  // ← 旧 mist[300] / mist[700]  dark-mode tertiary text
  900:  '#5E3E20',
  1000: '#000000',  // absolute black
} as const;

// ── Type exports ──────────────────────────────────────────────────────────────
export type AmberStep      = keyof typeof amber;
export type SurfaceStep    = keyof typeof surface;
export type SageStep       = keyof typeof sage;
export type RustStep       = keyof typeof rust;
export type GoldenrodStep  = keyof typeof goldenrod;
export type ComplementStep = keyof typeof complement;
export type NeutralStep    = keyof typeof neutral;
