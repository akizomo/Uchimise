import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, neutral, opacity, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

// Track dimensions (iOS HIG spec)
const TRACK_W  = 51;
const TRACK_H  = 31;
const THUMB_D  = 27;
const THUMB_TRAVEL = TRACK_W - THUMB_D - 2; // 22

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({
  value,
  onValueChange,
  label,
  sublabel,
  disabled = false,
  style,
}: SwitchProps) {
  const theme  = useTheme();
  const anim   = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue:        value ? 1 : 0,
      useNativeDriver: false,
      bounciness:     4,
      speed:          20,
    }).start();
  }, [value, anim]);

  const trackOff = theme.isDark ? neutral[700] : neutral[200];
  const trackOn  = theme.tint;

  const trackBg = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [trackOff, trackOn],
  });

  const thumbX = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [2, THUMB_TRAVEL],
  });

  return (
    <View style={[styles.row, style]}>
      {(label || sublabel) && (
        <View style={styles.labelGroup}>
          {label && (
            <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
          )}
          {sublabel && (
            <Text style={[styles.sublabel, { color: theme.labelSecondary }]}>
              {sublabel}
            </Text>
          )}
        </View>
      )}

      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        style={{ opacity: disabled ? opacity.disabled : 1 }}
      >
        <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
          <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            spacing.md,
  },
  labelGroup: {
    flex: 1,
    gap:  spacing.xxs,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.md,
  },
  sublabel: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
  },

  track: {
    width:        TRACK_W,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    width:        THUMB_D,
    height:       THUMB_D,
    borderRadius: THUMB_D / 2,
    backgroundColor: '#FFFFFF',
    // iOS-style subtle shadow on the thumb
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius:  2,
    elevation:     2,
  },
});
