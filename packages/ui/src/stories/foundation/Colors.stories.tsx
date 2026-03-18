import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  amber, complement, goldenrod, neutral, rust, sage,
  semantic, semanticTokenMap, surface,
} from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export default {
  title: 'Foundation/Colors',
  parameters: { layout: 'fullscreen' },
};

// ── Primitive story ───────────────────────────────────────────────────────────

function PrimitiveSwatch({ step, value }: { step: string; value: string }) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatchColor, { backgroundColor: value }]} />
      <View style={styles.swatchInfo}>
        <Text style={styles.swatchStep}>{step}</Text>
        <Text style={styles.swatchHex}>{value}</Text>
      </View>
    </View>
  );
}

function ScaleSection({ title, scale }: { title: string; scale: Record<string | number, string> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {Object.entries(scale).map(([step, value]) => (
        <PrimitiveSwatch key={step} step={step} value={value} />
      ))}
    </View>
  );
}

export function PrimitiveColors() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Primitive Colors</Text>
      <Text style={styles.pageSubtitle}>
        Layer 1 — pure tonal scales. Use only in semantic.ts, never in components.
      </Text>
      <ScaleSection title="amber" scale={amber} />
      <ScaleSection title="surface  (dark-mode layers)" scale={surface} />
      <ScaleSection title="sage" scale={sage} />
      <ScaleSection title="rust" scale={rust} />
      <ScaleSection title="goldenrod" scale={goldenrod} />
      <ScaleSection title="neutral  (warm gray — 旧 mist を統合)" scale={neutral} />
      <ScaleSection title="complement" scale={complement} />
    </ScrollView>
  );
}

// ── Semantic story ────────────────────────────────────────────────────────────

/**
 * Each semantic swatch shows:
 *   [color] role          ← semantic role name
 *           ↳ primitive   ← which primitive token backs it
 *           #hex          ← resolved value
 */
function SemanticSwatch({
  role,
  value,
  source,
}: {
  role: string;
  value: string;
  source: string;
}) {
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatchColor, { backgroundColor: value }]} />
      <View style={styles.swatchInfo}>
        <Text style={styles.swatchRole}>{role}</Text>
        <Text style={styles.swatchSource}>↳ {source}</Text>
        <Text style={styles.swatchHex}>{value}</Text>
      </View>
    </View>
  );
}

function SemanticSection({
  title,
  roles,
  values,
  mode,
}: {
  title: string;
  roles: (keyof typeof semanticTokenMap)[];
  values: Record<string, string>;
  mode: 'light' | 'dark';
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {roles.map((role) => (
        <SemanticSwatch
          key={role}
          role={role}
          value={values[role]}
          source={semanticTokenMap[role][mode]}
        />
      ))}
    </View>
  );
}

export function SemanticColors() {
  const theme = useTheme();
  const mode  = theme.isDark ? 'dark' : 'light';
  const roles = theme.isDark ? semantic.dark : semantic.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPage }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.pageTitle, { color: theme.label }]}>Semantic Colors</Text>
      <Text style={[styles.pageSubtitle, { color: theme.labelSecondary }]}>
        Layer 2 — iOS HIG roles. Each role shows which primitive token backs it.
        Switch the background to toggle dark mode.
      </Text>

      <SemanticSection title="Labels" mode={mode} values={roles} roles={[
        'label', 'labelSecondary', 'labelTertiary', 'labelQuaternary', 'labelPlaceholder',
      ]} />

      <SemanticSection title="Icons" mode={mode} values={roles} roles={[
        'iconPrimary', 'iconSecondary', 'iconTertiary', 'iconTint',
      ]} />

      <SemanticSection title="Fills" mode={mode} values={roles} roles={[
        'fillPrimary', 'fillSecondary', 'fillTertiary', 'fillQuaternary', 'fillTint',
      ]} />

      <SemanticSection title="Backgrounds" mode={mode} values={roles} roles={[
        'bgPrimary', 'bgSecondary', 'bgTertiary', 'bgCard',
        'bgGrouped', 'bgGroupedSecondary', 'bgNav', 'bgElevated',
      ]} />

      <SemanticSection title="Separators" mode={mode} values={roles} roles={[
        'separator', 'separatorOpaque',
      ]} />

      <SemanticSection title="CTA / Accent" mode={mode} values={roles} roles={[
        'tint', 'tintPressed', 'tintSubtle',
      ]} />

      <SemanticSection title="Status — Positive" mode={mode} values={roles} roles={[
        'positive', 'positiveBg', 'positiveBorder',
      ]} />

      <SemanticSection title="Status — Negative" mode={mode} values={roles} roles={[
        'negative', 'negativeBg', 'negativeBorder',
      ]} />

      <SemanticSection title="Status — Warning" mode={mode} values={roles} roles={[
        'warning', 'warningBg', 'warningBorder', 'warningText',
      ]} />

      <SemanticSection title="Status — Accent / NEW" mode={mode} values={roles} roles={[
        'accent', 'accentBg', 'accentBorder', 'link',
      ]} />

      <SemanticSection title="Navigation" mode={mode} values={roles} roles={[
        'navIconActive', 'navLabelActive', 'navIconInactive', 'navLabelInactive',
      ]} />

      <SemanticSection title="Overlay" mode={mode} values={roles} roles={['scrim']} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: 24, gap: 24 },

  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A1600',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#633806',
    marginBottom: 8,
    lineHeight: 20,
  },

  section: { gap: 6 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D4B896',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    marginTop: 4,
  },

  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatchColor: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(250,199,117,0.3)',
    flexShrink: 0,
  },
  swatchInfo: { flex: 1, gap: 1 },

  // Primitive story
  swatchStep: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2A1600',
  },

  // Semantic story
  swatchRole: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A1600',
  },
  swatchSource: {
    fontSize: 11,
    color: '#EF9F27',     // ochre — stands out as the "token reference" label
    fontFamily: 'monospace',
  },
  swatchHex: {
    fontSize: 10,
    color: '#B89070',     // mist.200 — subtle
    fontFamily: 'monospace',
  },
});
