import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { radius } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type ProgressBarVariant = 'default' | 'positive' | 'warning' | 'negative';

export interface ProgressBarProps {
  /** 0–1 */
  value: number;
  variant?: ProgressBarVariant;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  variant = 'default',
  height = 6,
  style,
}: ProgressBarProps) {
  const theme    = useTheme();
  const widthPct = useRef(new Animated.Value(clamp(value))).current;

  useEffect(() => {
    Animated.spring(widthPct, {
      toValue:         clamp(value),
      useNativeDriver: false,
      damping:         24,
      stiffness:       200,
    }).start();
  }, [value, widthPct]);

  const fillColor = {
    default:  theme.tint,
    positive: theme.positive,
    warning:  theme.warning,
    negative: theme.negative,
  }[variant];

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: theme.fillTertiary },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius:    height / 2,
            backgroundColor: fillColor,
            width:           widthPct.interpolate({
              inputRange:  [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

function clamp(v: number) { return Math.min(1, Math.max(0, v)); }

const styles = StyleSheet.create({
  track: {
    width:    '100%',
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
  },
});
