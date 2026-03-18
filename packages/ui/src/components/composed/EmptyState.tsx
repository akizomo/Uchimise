import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { calcLineHeight, fontFamily, fontSize, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';
import { Button } from '../primitives/Button';

export interface EmptyStateProps {
  /** Emoji or custom ReactNode shown above the title */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Label for the primary CTA button */
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}

      <Text style={[styles.title, { color: theme.label }]}>{title}</Text>

      {description && (
        <Text style={[styles.description, { color: theme.labelSecondary }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: calcLineHeight(fontSize.lg, 'normal'),
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: calcLineHeight(fontSize.md, 'relaxed'),
  },
  action: {
    marginTop: spacing.sm,
  },
});
