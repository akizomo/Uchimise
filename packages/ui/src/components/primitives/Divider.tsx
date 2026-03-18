import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface DividerProps {
  /** Left indent in pixels. Common values: 0 (full), spacing.xl (inset list row) */
  inset?: number;
  style?: ViewStyle;
}

export function Divider({ inset = 0, style }: DividerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.line,
        { backgroundColor: theme.separator, marginLeft: inset },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

export const DIVIDER_INSET_DEFAULT = spacing.xl; // 20 — standard iOS list inset
