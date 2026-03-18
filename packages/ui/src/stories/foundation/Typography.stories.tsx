import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontFamily, fontWeight, lineHeight } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export default {
  title: 'Foundation/Typography',
  parameters: { layout: 'fullscreen' },
};

function SpecimenRow({
  label,
  style,
  sample,
  meta,
}: {
  label: string;
  style: object;
  sample: string;
  meta: string;
}) {
  return (
    <View style={styles.specimenRow}>
      <Text style={[styles.specimenLabel]}>{label}</Text>
      <Text style={[styles.specimenMeta]}>{meta}</Text>
      <Text style={[styles.specimenSample, style]}>{sample}</Text>
    </View>
  );
}

export function TypeSpecimen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPage }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.pageTitle, { color: theme.label }]}>Typography</Text>

      {/* Heading — KleeOne */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heading — KleeOne</Text>
        <Text style={[styles.sectionDesc, { color: theme.labelSecondary }]}>
          カードタイトル・料理名・セクション見出し
        </Text>
        <SpecimenRow
          label="h1"
          meta={`${fontSize.h1}px / weight 700`}
          sample="おすすめレシピ"
          style={{ fontFamily: fontFamily.heading, fontSize: fontSize.h1, fontWeight: fontWeight.semibold, color: theme.label }}
        />
        <SpecimenRow
          label="h2"
          meta={`${fontSize.h2}px / weight 600`}
          sample="今週の人気レシピ"
          style={{ fontFamily: fontFamily.heading, fontSize: fontSize.h2, fontWeight: fontWeight.semibold, color: theme.label }}
        />
        <SpecimenRow
          label="xl"
          meta={`${fontSize.xl}px / weight 400`}
          sample="鶏むね肉のレモンソテー"
          style={{ fontFamily: fontFamily.heading, fontSize: fontSize.xl, color: theme.label }}
        />
        <SpecimenRow
          label="lg"
          meta={`${fontSize.lg}px / weight 400`}
          sample="材料（2人分）を確認"
          style={{ fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: theme.label }}
        />
      </View>

      {/* Body — NotoSansJP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body — Noto Sans JP</Text>
        <Text style={[styles.sectionDesc, { color: theme.labelSecondary }]}>
          UIラベル・説明文・タグ・ボタン
        </Text>
        <SpecimenRow
          label="md"
          meta={`${fontSize.md}px / weight 400`}
          sample="料理時間や材料を確認できます"
          style={{ fontFamily: fontFamily.body, fontSize: fontSize.md, color: theme.label, lineHeight: fontSize.md * lineHeight.normal }}
        />
        <SpecimenRow
          label="sm"
          meta={`${fontSize.sm}px / weight 400`}
          sample="保存済み · 確認済み · YouTube"
          style={{ fontFamily: fontFamily.body, fontSize: fontSize.sm, color: theme.labelSecondary }}
        />
        <SpecimenRow
          label="xs"
          meta={`${fontSize.xs}px / weight 400`}
          sample="⏱ 20分  |  @uchimise_cook"
          style={{ fontFamily: fontFamily.body, fontSize: fontSize.xs, color: theme.labelTertiary }}
        />
      </View>

      {/* Display — Plus Jakarta Sans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display — Plus Jakarta Sans</Text>
        <Text style={[styles.sectionDesc, { color: theme.labelSecondary }]}>
          ロゴ・数字・バッジ・タイムスタンプ
        </Text>
        <SpecimenRow
          label="xxl"
          meta={`${fontSize.xxl}px / weight 600`}
          sample="Uchimise"
          style={{ fontFamily: fontFamily.display, fontSize: fontSize.xxl, fontWeight: fontWeight.semibold, color: theme.tint }}
        />
        <SpecimenRow
          label="lg"
          meta={`${fontSize.lg}px / weight 500`}
          sample="142 レシピ保存済み"
          style={{ fontFamily: fontFamily.display, fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: theme.label }}
        />
        <SpecimenRow
          label="xs badge"
          meta={`${fontSize.xs}px / weight 600`}
          sample="NEW"
          style={{ fontFamily: fontFamily.display, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.accent }}
        />
      </View>

      {/* Scale */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size Scale</Text>
        {Object.entries(fontSize).map(([key, size]) => (
          <View key={key} style={styles.scaleRow}>
            <Text style={styles.scaleKey}>{key}</Text>
            <Text style={[{ fontSize: size, color: theme.label }]}>Aa — {size}px</Text>
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
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4B896',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionDesc: { fontSize: 12, marginBottom: 4 },
  specimenRow: { gap: 2, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(250,199,117,0.2)' },
  specimenLabel: { fontSize: 10, fontWeight: '600', color: '#D4B896', textTransform: 'uppercase' },
  specimenMeta: { fontSize: 10, color: '#D4B896', marginBottom: 4 },
  specimenSample: {},
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scaleKey: { fontSize: 10, fontWeight: '600', color: '#D4B896', width: 28 },
});
