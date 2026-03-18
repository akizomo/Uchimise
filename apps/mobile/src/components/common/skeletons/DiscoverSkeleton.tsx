import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, radius } from '@uchimise/tokens';

import { SkeletonBox } from '../SkeletonBox';

export function DiscoverSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.tagsRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBox
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            width={80}
            height={28}
            borderRadius={radius.pill}
          />
        ))}
      </View>
      <View style={styles.cards}>
        <SkeletonBox width="100%" height={96} borderRadius={radius.md} />
        <SkeletonBox width="100%" height={96} borderRadius={radius.md} />
        <SkeletonBox width="100%" height={96} borderRadius={radius.md} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  cards: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});

