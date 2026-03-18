import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, fontSize, fontFamily } from '@uchimise/tokens';

export interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

export function Badge({ label, color = colors.ivory, backgroundColor = colors.complement }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
