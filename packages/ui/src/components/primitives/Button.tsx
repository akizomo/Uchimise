import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';

import { fontFamily, fontSize, opacity, radius, spacing, spring } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button({ label, variant = 'primary', onPress, disabled = false, isLoading = false }: ButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, ...spring.snappy }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...spring.bouncy }).start();
  };

  return (
    <Animated.View style={[disabled && styles.disabled, { transform: [{ scale }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.base,
          isPrimary
            ? { backgroundColor: pressed ? theme.tintPressed : theme.tint }
            : {
                borderWidth: 1.5,
                borderColor: theme.tint,
                backgroundColor: pressed ? theme.tintSubtle : 'transparent',
              },
        ]}
        onPress={onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isPrimary ? '#FFFFFF' : theme.tint} />
        ) : (
          <Text style={[styles.label, { color: isPrimary ? '#FFFFFF' : theme.tint }]}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
