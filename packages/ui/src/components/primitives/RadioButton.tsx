import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, opacity, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

// ── Single item ───────────────────────────────────────────────────────────────

export interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const CIRCLE = 22;
const DOT    = 10;

export function RadioButton({
  selected,
  onPress,
  label,
  sublabel,
  disabled = false,
  style,
}: RadioButtonProps) {
  const theme  = useTheme();
  const dotS   = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(dotS, {
      toValue:         selected ? 1 : 0,
      useNativeDriver: true,
      damping:         18,
      stiffness:       350,
    }).start();
  }, [selected, dotS]);

  const borderColor = selected ? theme.tint : theme.separator;

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      style={[styles.row, disabled && { opacity: opacity.disabled }, style]}
    >
      <View style={[styles.circle, { borderColor }]}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: theme.tint },
            { transform: [{ scale: dotS }], opacity: dotS },
          ]}
        />
      </View>

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

// ── Group helper ──────────────────────────────────────────────────────────────

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
}

export interface RadioGroupProps<T extends string = string> {
  options: RadioOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function RadioGroup<T extends string = string>({
  options,
  value,
  onValueChange,
  disabled = false,
  style,
}: RadioGroupProps<T>) {
  return (
    <View style={[styles.group, style]}>
      {options.map((opt) => (
        <RadioButton
          key={opt.value}
          selected={opt.value === value}
          onPress={() => onValueChange(opt.value)}
          label={opt.label}
          sublabel={opt.sublabel}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  circle: {
    width:          CIRCLE,
    height:         CIRCLE,
    borderRadius:   CIRCLE / 2,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  dot: {
    width:        DOT,
    height:       DOT,
    borderRadius: DOT / 2,
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
  group: {
    gap: spacing.lg,
  },
});
