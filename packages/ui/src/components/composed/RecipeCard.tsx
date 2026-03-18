import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bookmark, BookmarkCheck, Timer } from 'lucide-react-native';

import { amber, calcLineHeight, fontFamily, fontSize, radius, spacing } from '@uchimise/tokens';
import { Icon } from '../primitives/Icon';

import { useTheme } from '../../hooks/useTheme';
import { Tag } from '../primitives/Tag';

export interface RecipeCardProps {
  title: string;
  creatorName: string;
  cookTimeMinutes?: number;
  sourceType: 'youtube' | 'instagram';
  thumbnailUrl?: string;
  isSaved?: boolean;
  isUnconfirmed?: boolean;
  onPress?: () => void;
  onSavePress?: () => void;
}

export function RecipeCard({
  title,
  creatorName,
  cookTimeMinutes,
  sourceType,
  thumbnailUrl,
  isSaved = false,
  isUnconfirmed = false,
  onPress,
  onSavePress,
}: RecipeCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.bgCard, borderColor: theme.border },
      ]}
      onPress={onPress}
    >
      {/* Thumbnail (60% height) */}
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailEmoji}>🍳</Text>
          </View>
        )}

        {/* SNS badge — top left */}
        <View style={styles.snsBadge}>
          <Text style={styles.snsBadgeText}>
            {sourceType === 'youtube' ? 'YouTube' : 'Instagram'}
          </Text>
        </View>

        {/* Bookmark — top right */}
        <Pressable style={styles.bookmarkButton} onPress={onSavePress}>
          <Icon
            as={isSaved ? BookmarkCheck : Bookmark}
            size="md"
            color={isSaved ? 'tint' : '#FFFFFF'}
            strokeWidth={isSaved ? 2 : 1.5}
          />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.textPrimary }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        <View style={styles.tagRow}>
          {cookTimeMinutes !== undefined && (
            <Tag
              label={`${cookTimeMinutes}分`}
              variant="time"
              icon={<Icon as={Timer} size={12} color="tint" />}
            />
          )}
          {isUnconfirmed && (
            <Tag label="未確認" variant="unconfirmed" />
          )}
          <Text style={[styles.creatorName, { color: theme.textTertiary }]}>
            {creatorName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 5 / 3, // ~60% height relative to width
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    backgroundColor: amber[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 40,
  },
  snsBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: `${amber[900]}CC`,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  snsBadgeText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: amber[50],
  },
  bookmarkButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    lineHeight: calcLineHeight(fontSize.md, 'snug'),
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  creatorName: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
  },
});
