import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, opacity, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';
import { Divider, DIVIDER_INSET_DEFAULT } from '../primitives/Divider';

export type ListRowTrailing = 'chevron' | 'none';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Left-side content — icon, avatar, emoji, etc. */
  leading?: React.ReactNode;
  /** Right-side accessory. 'chevron' | 'none' | custom ReactNode */
  trailing?: ListRowTrailing | React.ReactNode;
  onPress?: () => void;
  /** Show hairline divider at bottom */
  showDivider?: boolean;
  /** Red-tinted title for destructive actions */
  destructive?: boolean;
  style?: ViewStyle;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing = 'none',
  onPress,
  showDivider = true,
  destructive = false,
  style,
}: ListRowProps) {
  const theme = useTheme();

  const titleColor = destructive ? theme.negative : theme.label;

  const trailingNode =
    trailing === 'chevron' ? (
      <Text style={[styles.chevron, { color: theme.labelTertiary }]}>›</Text>
    ) : trailing === 'none' ? null : (
      trailing
    );

  const content = (
    <View style={[styles.row, style]}>
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.body}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: theme.labelSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {trailingNode && <View style={styles.trailing}>{trailingNode}</View>}
    </View>
  );

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityRole="button"
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {showDivider && (
        <Divider inset={leading ? DIVIDER_INSET_DEFAULT + 36 + spacing.md : DIVIDER_INSET_DEFAULT} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  leading: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  trailing: {
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
