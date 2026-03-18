import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { amber, calcLineHeight, fontFamily, fontSize, radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface ShopkeeperMsgProps {
  message: string;
  timestamp?: string;
  context?: string;
}

export function ShopkeeperMsg({ message, timestamp, context }: ShopkeeperMsgProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bgSurface },
      ]}
    >
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {(timestamp || context) && (
        <Text style={[styles.meta, { color: theme.textTertiary }]}>
          {[timestamp, context].filter(Boolean).join(' · ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderLeftColor: amber[300],
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  message: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    lineHeight: calcLineHeight(fontSize.md, 'relaxed'),
  },
  meta: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xs,
  },
});
