import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { fontFamily, fontSize, opacity, radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Label shown to the left of the stepper */
  label?: string;
  style?: ViewStyle;
}

export function Stepper({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  style,
}: StepperProps) {
  const theme    = useTheme();
  const canDec   = value > min;
  const canInc   = value < max;

  const decrement = () => { if (canDec) onValueChange(value - step); };
  const increment = () => { if (canInc) onValueChange(value + step); };

  return (
    <View style={[styles.row, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      )}

      <View style={[styles.control, { borderColor: theme.separator, backgroundColor: theme.fillTertiary }]}>
        <StepButton
          symbol="−"
          onPress={decrement}
          disabled={!canDec}
          color={theme.tint}
        />

        <View style={[styles.divider, { backgroundColor: theme.separator }]} />

        <Text style={[styles.value, { color: theme.label }]}>{value}</Text>

        <View style={[styles.divider, { backgroundColor: theme.separator }]} />

        <StepButton
          symbol="+"
          onPress={increment}
          disabled={!canInc}
          color={theme.tint}
        />
      </View>
    </View>
  );
}

function StepButton({
  symbol,
  onPress,
  disabled,
  color,
}: {
  symbol: string;
  onPress: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={4}
      style={({ pressed }) => [
        styles.stepBtn,
        pressed && !disabled && { opacity: opacity.pressed },
        disabled && { opacity: opacity.disabled },
      ]}
    >
      <Text style={[styles.symbol, { color }]}>{symbol}</Text>
    </Pressable>
  );
}

const CONTROL_H = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            spacing.md,
  },
  label: {
    flex:       1,
    fontFamily: fontFamily.body,
    fontSize:   fontSize.md,
  },
  control: {
    flexDirection:  'row',
    alignItems:     'center',
    height:         CONTROL_H,
    borderRadius:   radius.sm,
    borderWidth:    1,
    overflow:       'hidden',
  },
  stepBtn: {
    width:          CONTROL_H,
    height:         CONTROL_H,
    alignItems:     'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize:   20,
    fontWeight: '400',
    lineHeight: 24,
  },
  divider: {
    width:  1,
    height: CONTROL_H,
  },
  value: {
    minWidth:       32,
    textAlign:      'center',
    fontFamily:     fontFamily.body,
    fontSize:       fontSize.md,
    fontWeight:     '500',
  },
});
