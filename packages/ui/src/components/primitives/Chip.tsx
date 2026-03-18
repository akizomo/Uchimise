import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { amber, fontFamily, fontSize, opacity, radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  style,
}: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? {
              backgroundColor: theme.tintSubtle,
              borderColor:     theme.tint,
            }
          : {
              backgroundColor: 'transparent',
              borderColor:     theme.separator,
            },
        pressed && !disabled && { opacity: opacity.pressed },
        disabled && { opacity: opacity.disabled },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? amber[700] : theme.labelSecondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf:        'flex-start',
    flexDirection:    'row',
    alignItems:       'center',
    borderRadius:     radius.pill,
    borderWidth:      1.5,
    paddingHorizontal: spacing.md,
    paddingVertical:  spacing.xs,
    minHeight:        32,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
    fontWeight: '500',
  },
});
