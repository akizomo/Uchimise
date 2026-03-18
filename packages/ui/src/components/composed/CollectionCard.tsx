import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface CollectionCardProps {
  name: string;
  recipeCount: number;
  isAuto?: boolean;
  onPress?: () => void;
}

export function CollectionCard({ name, recipeCount, isAuto = false, onPress }: CollectionCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.bgCard, borderColor: theme.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        {isAuto && (
          <View style={[styles.autoBadge, { backgroundColor: theme.tintSubtle }]}>
            <Text style={[styles.autoBadgeText, { color: theme.tint }]}>店主おすすめ</Text>
          </View>
        )}
      </View>
      <Text style={[styles.count, { color: theme.textTertiary }]}>
        {recipeCount}品
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    flex: 1,
  },
  autoBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  autoBadgeText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
  },
  count: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.sm,
  },
});
