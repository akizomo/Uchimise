import React from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing, radius } from '@uchimise/tokens';

import { SkeletonBox } from '../SkeletonBox';

export function RecipeDetailSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox width="80%" height={24} borderRadius={radius.sm} />
      <SkeletonBox width="50%" height={16} borderRadius={radius.sm} style={styles.meta} />
      <SkeletonBox width="100%" height={200} borderRadius={radius.md} style={styles.thumbnail} />
      <SkeletonBox width="60%" height={20} borderRadius={radius.sm} style={styles.section} />
      <SkeletonBox width="100%" height={200} borderRadius={radius.md} />
      <SkeletonBox width="60%" height={20} borderRadius={radius.sm} style={styles.section} />
      <SkeletonBox width="100%" height={60} borderRadius={radius.md} style={styles.step} />
      <SkeletonBox width="100%" height={60} borderRadius={radius.md} style={styles.step} />
      <SkeletonBox width="100%" height={60} borderRadius={radius.md} style={styles.step} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  meta: {
    marginTop: spacing.xs,
  },
  thumbnail: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  step: {
    marginTop: spacing.sm,
  },
});

