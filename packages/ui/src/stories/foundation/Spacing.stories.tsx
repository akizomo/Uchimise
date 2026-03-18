import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export default {
  title: 'Foundation/Spacing',
  parameters: { layout: 'fullscreen' },
};

function SpacingRow({ name, value }: { name: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{name}</Text>
      <Text style={styles.rowValue}>{value}px</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: value * 4 }]} />
      </View>
    </View>
  );
}

function RadiusRow({ name, value }: { name: string; value: number }) {
  return (
    <View style={styles.radiusRow}>
      <View style={[styles.radiusBox, { borderRadius: Math.min(value, 32) }]} />
      <View>
        <Text style={styles.rowLabel}>{name}</Text>
        <Text style={styles.rowValue}>{value === 999 ? '999 (pill)' : `${value}px`}</Text>
      </View>
    </View>
  );
}

export function SpacingScale() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPage }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.pageTitle, { color: theme.label }]}>Spacing Scale</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spacing</Text>
        {Object.entries(spacing).map(([name, value]) => (
          <SpacingRow key={name} name={name} value={value} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius</Text>
        {Object.entries(radius).map(([name, value]) => (
          <RadiusRow key={name} name={name} value={value} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage Reference</Text>
        {[
          { key: 'xs (4)', usage: 'アイコン内パディング・バッジ縦' },
          { key: 'sm (8)', usage: 'タグ/チップの横パディング・行間gap' },
          { key: 'md (12)', usage: 'カード内パディング' },
          { key: 'lg (16)', usage: 'セクション間gap' },
          { key: 'xl (20)', usage: '画面端パディング（Safe Area内）' },
          { key: 'xxl (28)', usage: '大セクション間gap' },
        ].map(({ key, usage }) => (
          <View key={key} style={styles.usageRow}>
            <Text style={styles.usageKey}>{key}</Text>
            <Text style={[styles.usageValue, { color: theme.labelSecondary }]}>{usage}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 32 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#2A1600', marginBottom: 8 },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4B896',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A1600',
    width: 32,
  },
  rowValue: {
    fontSize: 11,
    color: '#633806',
    width: 40,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(250,199,117,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FAC775',
    borderRadius: 4,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  radiusBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FAC77533',
    borderWidth: 1.5,
    borderColor: '#FAC775',
  },
  usageRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(250,199,117,0.15)',
  },
  usageKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A1600',
    width: 72,
  },
  usageValue: {
    fontSize: 12,
    flex: 1,
  },
});
