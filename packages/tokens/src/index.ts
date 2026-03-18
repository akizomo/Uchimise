// ── Layer 1: Primitive color scales ──────────────────────────────────────────
// Named tonal families. Use in semantic.ts. Components should use useTheme() instead.
export {
  amber, surface, sage, rust, goldenrod, complement, neutral,
} from './primitive';
export type {
  AmberStep, SurfaceStep, SageStep, RustStep,
  GoldenrodStep, ComplementStep, NeutralStep,
} from './primitive';

// ── Backward-compat flat color map ────────────────────────────────────────────
// @deprecated — prefer primitive scales or useTheme() in components
export { colors } from './colors';
export type { ColorToken } from './colors';

// ── Non-color primitive tokens ────────────────────────────────────────────────
export { spacing } from './spacing';
export type { SpacingToken } from './spacing';

export { radius } from './radius';
export type { RadiusToken } from './radius';

export { fontFamily, fontWeight, fontSize, lineHeight, calcLineHeight, textStyle } from './typography';
export type { FontFamilyToken, FontWeightToken, FontSizeToken, LineHeightToken, TextStyleToken } from './typography';

// ── Layer 2: Semantic tokens (iOS HIG color roles) ────────────────────────────
export { semantic, semanticTokenMap } from './semantic';
export type { SemanticRole, SemanticTokens, SemanticTokenMapEntry } from './semantic';

// ── Elevation system (flat design — no shadows) ───────────────────────────────
export { elevationLayer } from './elevation';
export type { ElevationLayer } from './elevation';

// ── Motion ────────────────────────────────────────────────────────────────────
export { duration, spring, easingParams, transition } from './duration';
export type { DurationToken, SpringPreset, EasingPreset, TransitionPreset } from './duration';

// ── Z-index ───────────────────────────────────────────────────────────────────
export { zIndex } from './zIndex';
export type { ZIndexToken } from './zIndex';

// ── Opacity ───────────────────────────────────────────────────────────────────
export { opacity } from './opacity';
export type { OpacityToken } from './opacity';

// ── Shadow (⚠️ not for use in components — see shadow.ts) ─────────────────────
export { shadow } from './shadow';
export type { ShadowToken } from './shadow';
