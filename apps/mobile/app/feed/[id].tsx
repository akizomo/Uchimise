import React from 'react';
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { radius, spacing, textStyle } from '@uchimise/tokens';
import {
  AppBar,
  Button,
  EmptyState,
  SkeletonLoader,
  Tag,
  useTheme,
} from '@uchimise/ui';

import { useFeedItem } from '../../src/hooks/useFeedItem';

export default function FeedItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: item, isLoading, isError } = useFeedItem(id ?? '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title={item?.title ?? ''}
        variant="small"
        backAction={() => router.back()}
      />

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader width="100%" height={220} borderRadius={radius.md} />
          <SkeletonLoader width="60%" height={24} borderRadius={radius.sm} />
          <SkeletonLoader width="40%" height={18} borderRadius={radius.sm} />
          <View style={styles.tagsRow}>
            <SkeletonLoader width={72} height={28} borderRadius={radius.pill} />
            <SkeletonLoader width={72} height={28} borderRadius={radius.pill} />
          </View>
        </View>
      ) : isError || !item ? (
        <View style={styles.errorContainer}>
          <EmptyState
            title="読み込めませんでした。"
            description="もう一度試してみてください。"
            actionLabel="戻る"
            onAction={() => router.back()}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : null}

          <Text style={[textStyle.title, { color: theme.label }]}>
            {item.title}
          </Text>

          <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
            {item.creatorName}
          </Text>

          {item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag) => (
                <Tag key={tag} label={tag} variant="unconfirmed" />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {!isLoading && !isError && item && (
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.bgNav, borderTopColor: theme.border },
          ]}
        >
          <View style={styles.footerSecondary}>
            <Button
              label="動画で見る"
              variant="secondary"
              onPress={() => Linking.openURL(item.sourceUrl)}
            />
          </View>
          <View style={styles.footerPrimary}>
            <Button
              label="棚に保存する"
              onPress={() =>
                router.push(
                  `/(modal)/extract?url=${encodeURIComponent(item.sourceUrl)}`
                )
              }
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletonContainer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  thumbnail: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 0.5,
  },
  footerSecondary: { flex: 1 },
  footerPrimary: { flex: 2 },
});
