import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, radius } from '@uchimise/tokens';

import { SkeletonBox } from '../SkeletonBox';

export function PlanSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox width="100%" height={72} borderRadius={0} />
      <SkeletonBox width="90%" height={36} borderRadius={radius.md} style={styles.segment} />
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
  segment: {
    alignSelf: 'center',
  },
  cards: {
    gap: spacing.md,
  },
});

