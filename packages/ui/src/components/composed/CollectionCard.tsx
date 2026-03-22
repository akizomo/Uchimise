import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface CollectionCardProps {
  name: string;
  recipeCount: number;
  isAuto?: boolean;
  thumbnailUrls?: string[];
  onPress?: () => void;
}

export function CollectionCard({ name, recipeCount, isAuto = false, thumbnailUrls = [], onPress }: CollectionCardProps) {
  const theme = useTheme();

  const cells = Array.from({ length: 4 }, (_, i) => thumbnailUrls[i] ?? null);

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.bgCard, borderColor: colors.honey },
      ]}
      onPress={onPress}
    >
      <View style={styles.thumbnailGrid}>
        {cells.map((url, i) => (
          <View key={i} style={[styles.thumbnailCell, { backgroundColor: colors.ivory }]}>
            {url ? (
              <Image source={{ uri: url }} style={styles.thumbnailImage} />
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
            {name}
          </Text>
          {isAuto && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>自動</Text>
            </View>
          )}
        </View>
        <Text style={[styles.count, { color: theme.textTertiary }]}>
          {recipeCount}品
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    aspectRatio: 2,
  },
  thumbnailCell: {
    width: '50%',
    aspectRatio: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: spacing.md,
    gap: 2,
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
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.ochre,
  },
  autoBadgeText: {
    fontFamily: fontFamily.body,
    fontSize: 8,
    color: colors.cream,
  },
  count: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.sm,
  },
});
