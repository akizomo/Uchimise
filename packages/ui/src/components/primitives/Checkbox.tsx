import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { Icon } from './Icon';

import { fontFamily, fontSize, opacity, radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const BOX_SIZE = 22;

export function Checkbox({
  value,
  onValueChange,
  label,
  sublabel,
  disabled = false,
  style,
}: CheckboxProps) {
  const theme  = useTheme();
  const scale  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const checkO = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue:         value ? 1 : 0,
        useNativeDriver: true,
        damping:         18,
        stiffness:       350,
      }),
      Animated.timing(checkO, {
        toValue:         value ? 1 : 0,
        useNativeDriver: true,
        duration:        120,
      }),
    ]).start();
  }, [value, scale, checkO]);

  const boxBg     = scale.interpolate({ inputRange: [0, 1], outputRange: ['transparent', theme.tint] });
  const boxBorder = scale.interpolate({ inputRange: [0, 1], outputRange: [theme.separator, theme.tint] });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.row, disabled && { opacity: opacity.disabled }, style]}
    >
      <Animated.View
        style={[
          styles.box,
          { backgroundColor: boxBg, borderColor: boxBorder },
        ]}
      >
        <Animated.View style={{ opacity: checkO, transform: [{ scale }] }}>
          <Icon as={Check} size={14} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </Animated.View>

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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  box: {
    width:          BOX_SIZE,
    height:         BOX_SIZE,
    borderRadius:   radius.sm - 4,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
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
});
