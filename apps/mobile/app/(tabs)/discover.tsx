import React, { useEffect, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { spacing, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, AppBar, Chip, RecipeCard, useScrollHeader, useTheme } from '@uchimise/ui';

import { useFeed } from '../../src/hooks/useFeed';
import { DiscoverSkeleton } from '../../src/components/common';
import { useAuth } from '../../src/hooks/useAuth';
import { apiFetch } from '../../src/lib/apiClient';

const MOOD_TAGS = ['今日作れそう', '週末向け', '時短', '作り置き', 'ヘルシー'];
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { scrollY, onScroll: onScrollHeader } = useScrollHeader();
  const [healthStatus, setHealthStatus] = useState<string>('pending');
  const { session, isLoading: isAuthLoading } = useAuth();
  const [feedDebug, setFeedDebug] = useState<string>('');

  const activeTags = selectedMood ? [selectedMood] : undefined;
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFeed(activeTags, Boolean(session) && !isAuthLoading);

  const items = (data?.pages.flatMap((page) => page.data) ?? []).filter((item): item is NonNullable<typeof item> => item != null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/health`)
      .then(async (r) => {
        const text = await r.text();
        if (cancelled) return;
        setHealthStatus(`${r.status} ${text}`.slice(0, 120));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setHealthStatus(`error ${msg}`.slice(0, 120));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // When the feed is empty, fetch debug info once to identify why.
    if (!session || isAuthLoading) return;
    if (isLoading || isError) return;
    if (items.length !== 0) return;
    if (feedDebug) return;

    apiFetch<{ debug?: unknown; success: boolean }>('/api/feed?debug=1&limit=1')
      .then((res) => {
        const dbg = (res as { debug?: unknown }).debug;
        setFeedDebug(dbg ? JSON.stringify(dbg) : 'no debug payload');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setFeedDebug(`debug fetch failed: ${msg}`);
      });
  }, [session, isAuthLoading, isLoading, isError, items.length, feedDebug]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    onScrollHeader(event);
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="発見" variant="large" scrollY={scrollY} />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 気分タグフィルター */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodTagRow}
        >
          {MOOD_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={selectedMood === tag}
              onPress={() => setSelectedMood(selectedMood === tag ? null : tag)}
            />
          ))}
        </ScrollView>

        {isLoading ? (
          <DiscoverSkeleton />
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              読み込めませんでした。接続を確認して、もう一度試してみてください。
            </Text>
            <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
              API: {API_BASE}
            </Text>
            <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
              health: {healthStatus}
            </Text>
            {error instanceof Error && (
              <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
                {error.message}
              </Text>
            )}
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              {selectedMood
                ? `「${selectedMood}」に合うレシピが見つかりませんでした。別の言葉で探してみてください。`
                : 'まだ棚が空です。SNSで見つけたレシピを、ここに並べてみませんか。'}
            </Text>
            <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
              API: {API_BASE}
            </Text>
            <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
              health: {healthStatus}
            </Text>
            {feedDebug ? (
              <Text style={[textStyle.bodySm, { color: theme.labelTertiary, textAlign: 'center' }]}>
                debug: {feedDebug}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <RecipeCard
                  title={item.title}
                  creatorName={item.creatorName}
                  sourceType={item.sourceType}
                  thumbnailUrl={item.thumbnailUrl}
                  onPress={() => router.push(`/feed/${item.id}`)}
                  onSavePress={() => router.push(`/(modal)/extract?url=${encodeURIComponent(item.sourceUrl)}`)}
                />
              </View>
            ))}
            {isFetchingNextPage && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  moodTagRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  gridItem: { width: '100%' },
  loadingMore: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
