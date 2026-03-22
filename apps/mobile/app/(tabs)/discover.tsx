import React, { useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';

import { colors, spacing, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, Icon, useTheme } from '@uchimise/ui';

import { useFeed } from '../../src/hooks/useFeed';
import { DiscoverSkeleton } from '../../src/components/common';
import { useAuth } from '../../src/hooks/useAuth';

// --- Tag definitions ---
// key は DB の feed_content.tags に格納される実際のタグ値と一致させる。
// 'for_you' は特別値（フィルターなし・全件表示）。

type TagType = 'normal' | 'discover';

interface Tag {
  key: string;
  label: string;
  type: TagType;
}

const DISCOVER_TAGS: Tag[] = [
  { key: 'for_you',              label: 'For you',              type: 'normal' },
  { key: 'さっぱりと',            label: 'さっぱりと',            type: 'normal' },
  { key: 'しっかり食べたい',       label: 'しっかり食べたい',       type: 'normal' },
  { key: 'ちょっと特別に',         label: 'ちょっと特別に',         type: 'normal' },
  { key: '手軽に済ませたい',       label: '手軽に済ませたい',       type: 'normal' },
  { key: '初めての食材',           label: '初めての食材',           type: 'discover' },
  { key: '未知の国の料理',         label: '未知の国の料理',         type: 'discover' },
  { key: '作ったことのない調理法', label: '作ったことのない調理法', type: 'discover' },
  { key: '今が旬',                label: '今が旬',                type: 'normal' },
  { key: '週末の昼に',             label: '週末の昼に',             type: 'normal' },
  { key: '誰かに作りたい',         label: '誰かに作りたい',         type: 'normal' },
];

// --- FeedCard ---

interface FeedCardProps {
  title: string;
  thumbnailUrl?: string | null;
  isFirstChallenge?: boolean;
  isSaved?: boolean;
  onPress?: () => void;
  onSavePress?: () => void;
}

function FeedCard({ title, thumbnailUrl, isFirstChallenge, isSaved, onPress, onSavePress }: FeedCardProps) {
  return (
    <Pressable style={styles.feedCard} onPress={onPress}>
      <View style={styles.feedCardImageContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.feedCardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.feedCardImage, { backgroundColor: colors.ivory }]} />
        )}

        {isFirstChallenge && (
          <View style={styles.challengeBadge}>
            <Text style={styles.challengeBadgeText}>✦ 初挑戦</Text>
          </View>
        )}

        <Pressable
          style={styles.bookmarkButton}
          onPress={onSavePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            as={isSaved ? BookmarkCheck : Bookmark}
            size={16}
            color={isSaved ? 'tint' : colors.cream}
            strokeWidth={isSaved ? 2 : 1.5}
          />
        </Pressable>
      </View>

      <View style={styles.feedCardFooter}>
        <Text style={styles.feedCardTitle} numberOfLines={2}>{title}</Text>
      </View>
    </Pressable>
  );
}

// --- DiscoverScreen ---

export default function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string>('for_you');
  const { session, isLoading: isAuthLoading } = useAuth();

  // 'for_you' は全件表示（タグフィルターなし）
  const activeTags = selectedTag !== 'for_you' ? [selectedTag] : undefined;

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFeed(activeTags, Boolean(session) && !isAuthLoading);

  const items = (data?.pages.flatMap((page) => page.data) ?? []).filter(
    (item): item is NonNullable<typeof item> => item != null,
  );

  const leftColumn = items.filter((_, i) => i % 2 === 0);
  const rightColumn = items.filter((_, i) => i % 2 === 1);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  const selectedTagLabel = DISCOVER_TAGS.find((t) => t.key === selectedTag)?.label ?? '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      {/* 固定ヘッダー */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.bgPage }]}>
        {/* 検索バー */}
        <Pressable
          style={[styles.searchBar, { backgroundColor: colors.cream, borderColor: colors.honey }]}
          onPress={() => { /* TODO: 全画面検索へ遷移 */ }}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.mist }]}>
            レシピ・食材・気分で探す
          </Text>
        </Pressable>

        {/* タグ横スクロール */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}
        >
          {DISCOVER_TAGS.map((tag) => {
            const isSelected = selectedTag === tag.key;
            const label = tag.type === 'discover' ? `✦ ${tag.label}` : tag.label;
            return (
              <Pressable
                key={tag.key}
                style={[
                  styles.tagChip,
                  isSelected
                    ? { backgroundColor: colors.espresso, borderColor: colors.espresso }
                    : { backgroundColor: colors.cream, borderColor: colors.honey },
                ]}
                onPress={() => setSelectedTag(tag.key)}
              >
                <Text
                  style={[
                    styles.tagLabel,
                    { color: isSelected ? colors.cream : colors.espresso },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* フィード */}
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <DiscoverSkeleton />
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              読み込めませんでした。接続を確認して、もう一度試してみてください。
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              {selectedTag !== 'for_you'
                ? `「${selectedTagLabel}」に合うレシピが見つかりませんでした。別の言葉で探してみてください。`
                : 'まだ棚が空です。SNSで見つけたレシピを、ここに並べてみませんか。'}
            </Text>
          </View>
        ) : (
          <View style={styles.masonryGrid}>
            <View style={styles.masonryColumn}>
              {leftColumn.map((item) => (
                <FeedCard
                  key={item.id}
                  title={item.title}
                  thumbnailUrl={item.thumbnailUrl}
                  onPress={() => router.push(`/feed/${item.id}`)}
                  onSavePress={() =>
                    router.push(`/(modal)/extract?url=${encodeURIComponent(item.sourceUrl)}`)
                  }
                />
              ))}
            </View>
            <View style={styles.masonryColumn}>
              {rightColumn.map((item) => (
                <FeedCard
                  key={item.id}
                  title={item.title}
                  thumbnailUrl={item.thumbnailUrl}
                  onPress={() => router.push(`/feed/${item.id}`)}
                  onSavePress={() =>
                    router.push(`/(modal)/extract?url=${encodeURIComponent(item.sourceUrl)}`)
                  }
                />
              ))}
            </View>
          </View>
        )}

        {isFetchingNextPage && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    marginHorizontal: spacing.xl,
    height: 36,
    borderRadius: 8,
    borderWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  searchPlaceholder: {
    ...textStyle.bodySm,
  },
  tagRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  tagLabel: {
    ...textStyle.bodySm,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  masonryGrid: {
    flexDirection: 'row',
    padding: 10,
    gap: 6,
  },
  masonryColumn: {
    flex: 1,
    gap: 6,
  },
  feedCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.ivory,
  },
  feedCardImageContainer: {
    position: 'relative',
  },
  feedCardImage: {
    width: '100%',
    aspectRatio: 0.85,
  },
  challengeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.ochre,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  challengeBadgeText: {
    color: colors.cream,
    fontSize: 8,
    fontWeight: '500',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(42,22,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedCardFooter: {
    padding: spacing.sm,
  },
  feedCardTitle: {
    ...textStyle.bodySm,
    color: colors.espresso,
    fontWeight: '500',
    fontSize: 13,
  },
  loadingMore: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
