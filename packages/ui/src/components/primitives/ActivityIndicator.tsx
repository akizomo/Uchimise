import React from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type ActivityIndicatorSize = 'small' | 'large';

export interface ActivityIndicatorProps {
  size?: ActivityIndicatorSize;
  /** Override color — defaults to theme.tint */
  color?: string;
  /** Optional label below the spinner */
  label?: string;
  style?: ViewStyle;
}

export function ActivityIndicator({
  size = 'small',
  color,
  label,
  style,
}: ActivityIndicatorProps) {
  const theme      = useTheme();
  const spinColor  = color ?? theme.tint;

  if (!label) {
    return (
      <RNActivityIndicator
        size={size}
        color={spinColor}
        style={style}
      />
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <RNActivityIndicator size={size} color={spinColor} />
      <Text style={[styles.label, { color: theme.labelSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap:        spacing.sm,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
  },
});
