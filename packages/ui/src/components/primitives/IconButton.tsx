import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { radius } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'ghost' | 'filled' | 'tinted';

export interface IconButtonProps {
  /** Icon content — pass an emoji, Text, or custom ReactNode */
  icon: React.ReactNode;
  onPress?: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

const SIZE: Record<IconButtonSize, { container: number; borderRadius: number }> = {
  sm: { container: 28, borderRadius: radius.sm },
  md: { container: 36, borderRadius: 12 },
  lg: { container: 44, borderRadius: radius.md },
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const dim = SIZE[size];

  // pressed 時は opacity ではなく背景色変化でフィードバック（iOS 標準）
  const getBgColor = (pressed: boolean) => {
    if (variant === 'filled')  return pressed ? theme.tintPressed  : theme.tint;
    if (variant === 'tinted')  return pressed ? theme.fillSecondary : theme.tintSubtle;
    /* ghost */                return pressed ? theme.fillSecondary : 'transparent';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          width: dim.container,
          height: dim.container,
          borderRadius: dim.borderRadius,
          backgroundColor: getBgColor(pressed),
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <View style={styles.iconWrap}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
