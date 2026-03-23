import React from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, ExternalLink, Share2 } from 'lucide-react-native';

import { colors, radius, spacing, textStyle } from '@uchimise/tokens';
import {
  Button,
  EmptyState,
  Icon,
  SkeletonLoader,
  Tag,
  useTheme,
} from '@uchimise/ui';

import { useFeedItem } from '../../src/hooks/useFeedItem';

// ─── HeroImage ───────────────────────────────────────────────────────────────

interface HeroImageProps {
  thumbnailUrl: string | null;
  onBack: () => void;
}

const HERO_HEIGHT = 200;
const OVERLAY_BUTTON_SIZE = 32;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios' ? (StatusBar.currentHeight ?? 44) : (StatusBar.currentHeight ?? 0);

function HeroImage({ thumbnailUrl, onBack }: HeroImageProps) {
  return (
    <View style={heroStyles.container}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={heroStyles.image} resizeMode="cover" />
      ) : (
        <View style={[heroStyles.image, heroStyles.imageFallback]}>
          <Text style={heroStyles.imageFallbackEmoji}>🍳</Text>
        </View>
      )}

      <View style={heroStyles.topRow}>
        <Pressable
          style={heroStyles.overlayButton}
          onPress={onBack}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Icon as={ArrowLeft} size={16} color={colors.cream} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT + STATUS_BAR_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  image: { ...StyleSheet.absoluteFillObject },
  imageFallback: {
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackEmoji: { fontSize: 48 },
  topRow: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + spacing.sm,
    left: spacing.md,
  },
  overlayButton: {
    width: OVERLAY_BUTTON_SIZE,
    height: OVERLAY_BUTTON_SIZE,
    borderRadius: OVERLAY_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(42,22,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── ActionItem ───────────────────────────────────────────────────────────────

interface ActionItemProps {
  iconNode: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionItem({ iconNode, label, onPress }: ActionItemProps) {
  const theme = useTheme();
  return (
    <Pressable style={actionStyles.item} onPress={onPress} accessibilityRole="button">
      <View
        style={[
          actionStyles.iconWrap,
          { backgroundColor: theme.bgSecondary, borderColor: theme.border },
        ]}
      >
        {iconNode}
      </View>
      <Text style={[actionStyles.label, { color: theme.labelSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const actionStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyle.micro,
    textAlign: 'center',
  },
});

// ─── FeedItemScreen ──────────────────────────────────────────────────────────

export default function FeedItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: item, isLoading, isError } = useFeedItem(id ?? '');

  async function handleShare() {
    if (!item) return;
    try {
      await Share.share({ url: item.sourceUrl, message: item.title });
    } catch {
      // ユーザーがキャンセルした場合は何もしない
    }
  }

  function handleSave() {
    if (!item) return;
    router.push(`/(modal)/extract?url=${encodeURIComponent(item.sourceUrl)}`);
  }

  function handleOpenSource() {
    if (!item) return;
    Linking.openURL(item.sourceUrl);
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <View
          style={[
            heroStyles.container,
            { height: HERO_HEIGHT + STATUS_BAR_HEIGHT, backgroundColor: colors.linen },
          ]}
        />
        <View style={styles.skeletonBody}>
          <SkeletonLoader width="70%" height={22} borderRadius={radius.sm} />
          <SkeletonLoader width="40%" height={16} borderRadius={radius.sm} />
          <View style={styles.skeletonActionRow}>
            <SkeletonLoader width={56} height={56} borderRadius={28} />
            <SkeletonLoader width={56} height={56} borderRadius={28} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (isError || !item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <EmptyState
          title="読み込めませんでした。"
          description="もう一度試してみてください。"
          actionLabel="戻る"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ヒーロー写真 */}
        <HeroImage thumbnailUrl={item.thumbnailUrl} onBack={() => router.back()} />

        {/* タイトルエリア */}
        <View style={[styles.titleArea, { borderBottomColor: theme.border }]}>
          <Text style={[styles.recipeTitle, { color: theme.label }]}>{item.title}</Text>
          {item.creatorName ? (
            <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
              {item.creatorName}
            </Text>
          ) : null}

          {/* アクション行: 棚に保存 / シェア */}
          <View style={styles.actionRow}>
            <ActionItem
              iconNode={
                <Icon as={Bookmark} size={20} color={colors.espresso} strokeWidth={1.5} />
              }
              label="棚に保存"
              onPress={handleSave}
            />
            <ActionItem
              iconNode={
                <Icon as={Share2} size={20} color={colors.espresso} strokeWidth={1.5} />
              }
              label="シェア"
              onPress={handleShare}
            />
            {/* 3列バランスのためのスペーサー */}
            <View style={actionStyles.item} />
          </View>
        </View>

        {/* タグ */}
        {item.tags.length > 0 && (
          <View style={styles.body}>
            <View style={styles.tagsRow}>
              <Tag
                label={item.sourceType === 'youtube' ? 'YouTube' : 'Instagram'}
                variant="source"
              />
              {item.tags.map((tag) => (
                <Tag key={tag} label={tag} variant="time" />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 下部固定エリア */}
      <SafeAreaView
        style={[
          styles.footer,
          { backgroundColor: theme.bgNav, borderTopColor: theme.border },
        ]}
      >
        <View style={styles.footerRow}>
          <View style={styles.footerVideo}>
            <Button label="動画を見る" variant="secondary" onPress={handleOpenSource} />
          </View>
          <View style={styles.footerSave}>
            <Button label="棚に保存する" onPress={handleSave} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  skeletonBody: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  skeletonActionRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },

  // タイトルエリア
  titleArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    gap: spacing.xs,
  },
  recipeTitle: {
    ...textStyle.title,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },

  // 本文
  body: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  // フッター
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerVideo: { flex: 1 },
  footerSave: { flex: 2 },
});
