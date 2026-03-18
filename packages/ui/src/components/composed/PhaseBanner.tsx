import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface PhaseBannerProps {
  visible?: boolean;
}

export function PhaseBanner({ visible = true }: PhaseBannerProps) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [visible, pulseAnim]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
      <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: theme.warning }]} />
      <Text style={[styles.text, { color: theme.warningText }]}>
        材料と手順を整理しています…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});
