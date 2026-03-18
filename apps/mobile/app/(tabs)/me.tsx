import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { radius, spacing, textStyle } from '@uchimise/tokens';
import { AppBar, useScrollHeader, useTheme } from '@uchimise/ui';

import { useCookingRecords } from '../../src/hooks/useCookingRecords';
import { MeSkeleton } from '../../src/components/common';

function formatCookedAt(isoString: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export default function MeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { scrollY, onScroll } = useScrollHeader();

  const {
    data: records,
    isLoading,
    isError,
  } = useCookingRecords();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="自分" variant="large" scrollY={scrollY} />

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <MeSkeleton />
        ) : isError ? (
          <View style={styles.centerState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              うまく読み込めませんでした。時間をおいてからもう一度お試しください。
            </Text>
          </View>
        ) : !records || records.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyEmoji}>🍳</Text>
            <Text style={[textStyle.titleSm, { color: theme.label }]}>
              調理の記録がまだありません。
            </Text>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              作った料理がここに残っていきます。
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((record) => (
              <Pressable
                key={record.id}
                onPress={() => router.push(`/recipe/${record.recipe_id}`)}
                style={[
                  styles.recordRow,
                  { backgroundColor: theme.bgSecondary, borderColor: theme.border },
                ]}
              >
                <View style={styles.recordBody}>
                  <Text style={[textStyle.titleSm, { color: theme.label }]} numberOfLines={2}>
                    {record.recipes?.title ?? 'レシピ'}
                  </Text>
                  <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
                    {formatCookedAt(record.cooked_at)}
                  </Text>
                  {record.note ? (
                    <Text
                      style={[textStyle.bodySm, { color: theme.labelTertiary }]}
                      numberOfLines={1}
                    >
                      {record.note}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl * 2,
  },
  emptyEmoji: { fontSize: 48 },
  recordsList: {
    gap: spacing.sm,
  },
  recordRow: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
  },
  recordBody: {
    gap: spacing.xs,
  },
});
