import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface NavigationBarProps {
  title: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function NavigationBar({ title, rightAction }: NavigationBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgNav }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {rightAction && (
        <Pressable onPress={rightAction.onPress} style={styles.rightAction}>
          <Text style={[styles.rightActionLabel, { color: theme.textSecondary }]}>
            {rightAction.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: 26,
    fontWeight: '700',
  },
  rightAction: {
    padding: spacing.xs,
  },
  rightActionLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
});
