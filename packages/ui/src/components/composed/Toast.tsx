import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CheckCircle, Info, TriangleAlert, XCircle } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Icon } from '../primitives/Icon';

import { calcLineHeight, fontFamily, fontSize, radius, spacing, spring, zIndex } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';
import { makeTimingConfig } from '../../motion';

export type ToastVariant = 'default' | 'positive' | 'negative' | 'warning';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  /** Auto-dismiss after ms. 0 = manual only */
  duration?: number;
  onHide?: () => void;
}

const ICON: Record<ToastVariant, LucideIcon> = {
  default:  Info,
  positive: CheckCircle,
  negative: XCircle,
  warning:  TriangleAlert,
};

export function Toast({
  message,
  variant = 'default',
  visible,
  duration = 3000,
  onHide,
}: ToastProps) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        ...makeTimingConfig('sheetOut'),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        ...makeTimingConfig('fadeOut'),
        useNativeDriver: true,
      }),
    ]).start(() => onHide?.());
  }, [onHide, opacity, translateY]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          ...spring.sheet,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          ...makeTimingConfig('fadeIn'),
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        timerRef.current = setTimeout(hide, duration);
      }
    } else {
      hide();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, hide, opacity, translateY]);

  const iconColor = {
    default:  theme.tint,
    positive: theme.positive,
    negative: theme.negative,
    warning:  theme.warning,
  }[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.bgElevated,
          borderWidth: 1,
          borderColor: theme.separatorOpaque,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Icon as={ICON[variant]} size="sm" color={iconColor} />
      <Text style={[styles.message, { color: theme.label }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    zIndex: zIndex.toast,
  },
  message: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: calcLineHeight(fontSize.sm, 'normal'),
  },
});
