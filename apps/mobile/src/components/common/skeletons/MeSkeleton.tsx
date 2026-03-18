import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, radius } from '@uchimise/tokens';

import { SkeletonBox } from '../SkeletonBox';

export function MeSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox width="100%" height={80} borderRadius={radius.md} />
      <SkeletonBox width="100%" height={80} borderRadius={radius.md} />
      <SkeletonBox width="100%" height={80} borderRadius={radius.md} />
      <SkeletonBox width="100%" height={80} borderRadius={radius.md} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});

