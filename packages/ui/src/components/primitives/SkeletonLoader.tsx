import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Single shimmer rectangle. Compose multiples to build skeleton screens. */
export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonLoaderProps) {
  const theme  = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // Oscillate between base fill and a slightly brighter fill
  const opacity = shimmer.interpolate({
    inputRange:  [0, 1],
    outputRange: [1, 0.45],
  });

  return (
    <Animated.View
      style={[
        { height, borderRadius, backgroundColor: theme.fillPrimary } as const,
        width !== undefined ? { width } as object : { alignSelf: 'stretch' as const },
        { opacity },
        style,
      ]}
    />
  );
}

// ── Preset compositions ───────────────────────────────────────────────────────

interface SkeletonTextProps {
  lines?: number;
  style?: ViewStyle;
}

/** Multiple stacked skeleton lines that mimic a paragraph of text */
export function SkeletonText({ lines = 3, style }: SkeletonTextProps) {
  return (
    <View style={[styles.textGroup, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          width={i === lines - 1 ? '65%' : '100%'}
          height={14}
        />
      ))}
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

/** Skeleton for a RecipeCard */
export function SkeletonCard({ style }: SkeletonCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgCard, borderColor: theme.separator },
        style,
      ]}
    >
      <SkeletonLoader width="100%" height={160} borderRadius={0} />
      <View style={styles.cardBody}>
        <SkeletonLoader height={16} width="80%" />
        <SkeletonLoader height={13} width="50%" />
        <View style={styles.cardFooter}>
          <SkeletonLoader height={22} width={56} borderRadius={radius.pill} />
          <SkeletonLoader height={22} width={44} borderRadius={radius.pill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textGroup: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: radius.md,
    borderWidth:  0.5,
    overflow:     'hidden',
  },
  cardBody: {
    padding: spacing.md,
    gap:     spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    gap:           spacing.sm,
    marginTop:     spacing.xs,
  },
});
