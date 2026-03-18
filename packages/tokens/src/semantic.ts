import { amber, complement, goldenrod, neutral, rust, sage, surface } from './primitive';

/**
 * Layer 2: Semantic Tokens
 *
 * primitive スケールのステップを iOS HIG の色ロールに対応させる。
 * コンポーネントはここから useTheme() 経由でのみ参照する。
 *
 * alpha hex suffix:
 *   4%→0A  5%→0D  8%→14  9%→17  10%→1A  12%→1F
 *  15%→26  18%→2E  20%→33  35%→59  40%→66  50%→80  60%→99
 */
export const semantic = {
  light: {
    // ── Labels ────────────────────────────────────────────────────────────────
    label:            amber[900],
    labelSecondary:   amber[800],
    labelTertiary:    neutral[400],
    labelQuaternary:  `${neutral[400]}80`,     // neutral[400] @50%
    labelPlaceholder: neutral[400],

    // ── Icons ─────────────────────────────────────────────────────────────────
    iconPrimary:   amber[900],
    iconSecondary: amber[800],
    iconTertiary:  neutral[400],
    iconTint:      amber[500],

    // ── Fills ─────────────────────────────────────────────────────────────────
    fillPrimary:    `${amber[300]}33`,          // honey @20%
    fillSecondary:  `${amber[300]}26`,          // honey @15%
    fillTertiary:   `${amber[300]}1A`,          // honey @10%
    fillQuaternary: `${amber[300]}0D`,          // honey @5%
    fillTint:       `${amber[500]}1A`,          // ochre @10%

    // ── Backgrounds ───────────────────────────────────────────────────────────
    bgPrimary:          amber[200],
    bgSecondary:        amber[50],
    bgTertiary:         amber[50],
    bgCard:             amber[50],
    bgGrouped:          amber[200],
    bgGroupedSecondary: amber[50],
    bgNav:              amber[50],
    bgElevated:         neutral[0],

    // ── Separators ────────────────────────────────────────────────────────────
    separator:       `${amber[300]}80`,         // honey @50%
    separatorOpaque: amber[300],

    // ── CTA ───────────────────────────────────────────────────────────────────
    tint:        amber[500],
    tintPressed: amber[600],
    tintSubtle:  `${amber[500]}1A`,             // ochre @10%

    // ── Status: Positive ──────────────────────────────────────────────────────
    positive:        sage[700],                 // 4.6:1 on white ✓
    positiveBg:      `${sage[500]}1F`,          // sage[500] @12%
    positiveBorder:  sage[500],
    positiveStrong:  sage[900],                 // solid fill — white text

    // ── Status: Negative ──────────────────────────────────────────────────────
    negative:        rust[600],                 // 5.4:1 on white ✓
    negativeBg:      `${rust[500]}1A`,          // rust[500] @10%
    negativeBorder:  rust[500],
    negativeStrong:  rust[900],                 // solid fill — white text

    // ── Status: Warning ───────────────────────────────────────────────────────
    warning:        goldenrod[600],
    warningBg:      `${goldenrod[400]}1A`,      // goldenrod[400] @10%
    warningBorder:  goldenrod[400],
    warningText:    goldenrod[700],             // 7.0:1 on white ✓
    warningStrong:  goldenrod[900],             // solid fill — white text

    // ── Status: Accent ────────────────────────────────────────────────────────
    accent:        complement[600],             // 4.5:1 on white ✓
    accentBg:      `${complement[500]}1F`,      // complement[500] @12%
    accentBorder:  complement[500],
    accentStrong:  complement[900],             // solid fill — white text

    // ── Link ──────────────────────────────────────────────────────────────────
    link: complement[600],

    // ── Navigation ────────────────────────────────────────────────────────────
    navIconActive:    amber[500],
    navLabelActive:   amber[500],
    navIconInactive:  `${amber[800]}66`,        // walnut @40%
    navLabelInactive: `${amber[800]}66`,

    // ── Overlay ───────────────────────────────────────────────────────────────
    scrim: `${neutral[1000]}66`,                // black @40%
  },

  dark: {
    // ── Labels ────────────────────────────────────────────────────────────────
    label:            amber[200],
    labelSecondary:   neutral[400],
    labelTertiary:    `${neutral[400]}99`,      // neutral[400] @60%
    labelQuaternary:  `${neutral[400]}66`,      // neutral[400] @40%
    labelPlaceholder: `${neutral[400]}80`,      // neutral[400] @50%

    // ── Icons ─────────────────────────────────────────────────────────────────
    iconPrimary:   amber[200],
    iconSecondary: neutral[400],
    iconTertiary:  `${neutral[400]}99`,
    iconTint:      amber[500],

    // ── Fills ─────────────────────────────────────────────────────────────────
    fillPrimary:    `${amber[300]}2E`,          // honey @18%
    fillSecondary:  `${amber[300]}1F`,          // honey @12%
    fillTertiary:   `${amber[300]}14`,          // honey @8%
    fillQuaternary: `${amber[300]}0A`,          // honey @4%
    fillTint:       `${amber[500]}1A`,          // ochre @10%

    // ── Backgrounds ───────────────────────────────────────────────────────────
    bgPrimary:          surface[0],
    bgSecondary:        surface[1],
    bgTertiary:         surface[3],
    bgCard:             surface[2],
    bgGrouped:          surface[0],
    bgGroupedSecondary: surface[1],
    bgNav:              surface[1],
    bgElevated:         surface[4],

    // ── Separators ────────────────────────────────────────────────────────────
    separator:       `${amber[300]}1F`,         // honey @12%
    separatorOpaque: surface[3],

    // ── CTA ───────────────────────────────────────────────────────────────────
    tint:        amber[500],
    tintPressed: amber[600],
    tintSubtle:  `${amber[500]}1A`,

    // ── Status: Positive ──────────────────────────────────────────────────────
    positive:        sage[400],                 // lighter for dark bg
    positiveBg:      `${sage[500]}1F`,
    positiveBorder:  sage[500],
    positiveStrong:  sage[600],                 // solid fill — lighter in dark mode

    // ── Status: Negative ──────────────────────────────────────────────────────
    negative:        rust[400],
    negativeBg:      `${rust[500]}1A`,
    negativeBorder:  rust[500],
    negativeStrong:  rust[600],

    // ── Status: Warning ───────────────────────────────────────────────────────
    warning:        goldenrod[400],
    warningBg:      `${goldenrod[400]}1A`,
    warningBorder:  goldenrod[400],
    warningText:    goldenrod[400],
    warningStrong:  goldenrod[600],

    // ── Status: Accent ────────────────────────────────────────────────────────
    accent:        complement[400],
    accentBg:      `${complement[500]}1F`,
    accentBorder:  complement[500],
    accentStrong:  complement[600],

    // ── Link ──────────────────────────────────────────────────────────────────
    link: complement[400],

    // ── Navigation ────────────────────────────────────────────────────────────
    navIconActive:    amber[500],
    navLabelActive:   amber[500],
    navIconInactive:  `${amber[200]}59`,        // cream @35%
    navLabelInactive: `${amber[200]}59`,

    // ── Overlay ───────────────────────────────────────────────────────────────
    scrim: `${neutral[1000]}99`,                // black @60%
  },
} as const;

export type SemanticRole   = keyof typeof semantic.light;
export type SemanticTokens = typeof semantic.light;

/**
 * Primitive token source map
 *
 * 各セマンティックロールがどの primitive スケールのどのステップを参照しているかを記録。
 * `satisfies` により、semantic に新ロールを追加したが map に記載しない場合 TypeScript エラーになる。
 *
 * 表記:
 *   ソリッド    → "family[step]"          例: "amber[500]"
 *   アルファ    → "family[step] · αNN%"   例: "amber[300] · α50%"
 */
export const semanticTokenMap = {
  // Labels
  label:            { light: 'amber[900]',           dark: 'amber[200]'           },
  labelSecondary:   { light: 'amber[800]',           dark: 'neutral[400]'         },
  labelTertiary:    { light: 'neutral[400]',         dark: 'neutral[400] · α60%'  },
  labelQuaternary:  { light: 'neutral[400] · α50%',  dark: 'neutral[400] · α40%'  },
  labelPlaceholder: { light: 'neutral[400]',         dark: 'neutral[400] · α50%'  },

  // Icons
  iconPrimary:   { light: 'amber[900]',              dark: 'amber[200]'           },
  iconSecondary: { light: 'amber[800]',              dark: 'neutral[400]'         },
  iconTertiary:  { light: 'neutral[400]',            dark: 'neutral[400] · α60%'  },
  iconTint:      { light: 'amber[500]',              dark: 'amber[500]'           },

  // Fills
  fillPrimary:    { light: 'amber[300] · α20%',      dark: 'amber[300] · α18%'    },
  fillSecondary:  { light: 'amber[300] · α15%',      dark: 'amber[300] · α12%'    },
  fillTertiary:   { light: 'amber[300] · α10%',      dark: 'amber[300] · α8%'     },
  fillQuaternary: { light: 'amber[300] · α5%',       dark: 'amber[300] · α4%'     },
  fillTint:       { light: 'amber[500] · α10%',      dark: 'amber[500] · α10%'    },

  // Backgrounds
  bgPrimary:          { light: 'amber[200]',          dark: 'surface[0]'           },
  bgSecondary:        { light: 'amber[50]',           dark: 'surface[1]'           },
  bgTertiary:         { light: 'amber[50]',           dark: 'surface[3]'           },
  bgCard:             { light: 'amber[50]',           dark: 'surface[2]'           },
  bgGrouped:          { light: 'amber[200]',          dark: 'surface[0]'           },
  bgGroupedSecondary: { light: 'amber[50]',           dark: 'surface[1]'           },
  bgNav:              { light: 'amber[50]',           dark: 'surface[1]'           },
  bgElevated:         { light: 'neutral[0]',          dark: 'surface[4]'           },

  // Separators
  separator:       { light: 'amber[300] · α50%',     dark: 'amber[300] · α12%'    },
  separatorOpaque: { light: 'amber[300]',             dark: 'surface[3]'           },

  // CTA
  tint:        { light: 'amber[500]',                dark: 'amber[500]'            },
  tintPressed: { light: 'amber[600]',                dark: 'amber[600]'            },
  tintSubtle:  { light: 'amber[500] · α10%',         dark: 'amber[500] · α10%'    },

  // Status: Positive
  positive:       { light: 'sage[700]',              dark: 'sage[400]'             },
  positiveBg:     { light: 'sage[500] · α12%',       dark: 'sage[500] · α12%'     },
  positiveBorder: { light: 'sage[500]',              dark: 'sage[500]'             },
  positiveStrong: { light: 'sage[900]',              dark: 'sage[600]'             },

  // Status: Negative
  negative:       { light: 'rust[600]',              dark: 'rust[400]'             },
  negativeBg:     { light: 'rust[500] · α10%',       dark: 'rust[500] · α10%'     },
  negativeBorder: { light: 'rust[500]',              dark: 'rust[500]'             },
  negativeStrong: { light: 'rust[900]',              dark: 'rust[600]'             },

  // Status: Warning
  warning:       { light: 'goldenrod[600]',          dark: 'goldenrod[400]'        },
  warningBg:     { light: 'goldenrod[400] · α10%',   dark: 'goldenrod[400] · α10%'},
  warningBorder: { light: 'goldenrod[400]',          dark: 'goldenrod[400]'        },
  warningText:   { light: 'goldenrod[700]',          dark: 'goldenrod[400]'        },
  warningStrong: { light: 'goldenrod[900]',          dark: 'goldenrod[600]'        },

  // Status: Accent
  accent:        { light: 'complement[600]',         dark: 'complement[400]'       },
  accentBg:      { light: 'complement[500] · α12%',  dark: 'complement[500] · α12%'},
  accentBorder:  { light: 'complement[500]',         dark: 'complement[500]'       },
  accentStrong:  { light: 'complement[900]',         dark: 'complement[600]'       },

  // Link
  link: { light: 'complement[600]',                  dark: 'complement[400]'       },

  // Navigation
  navIconActive:    { light: 'amber[500]',            dark: 'amber[500]'           },
  navLabelActive:   { light: 'amber[500]',            dark: 'amber[500]'           },
  navIconInactive:  { light: 'amber[800] · α40%',    dark: 'amber[200] · α35%'    },
  navLabelInactive: { light: 'amber[800] · α40%',    dark: 'amber[200] · α35%'    },

  // Overlay
  scrim: { light: 'neutral[1000] · α40%',            dark: 'neutral[1000] · α60%' },

} satisfies Record<SemanticRole, { light: string; dark: string }>;

export type SemanticTokenMapEntry = typeof semanticTokenMap[SemanticRole];
