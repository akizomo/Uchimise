import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { calcLineHeight, fontFamily, fontSize, opacity, radius, spacing, spring } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';
import { makeTimingConfig } from '../../motion';
import { Divider } from '../primitives/Divider';

export interface AlertDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  /** Confirm button label — use a verb: "削除する" / "取り出す" etc. */
  confirmLabel: string;
  /** Cancel button label — defaults to "そのままにする" (iOS convention) */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Renders confirm button in negative (rust) color */
  destructive?: boolean;
}

export function AlertDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'そのままにする',
  onConfirm,
  onCancel,
  destructive = false,
}: AlertDialogProps) {
  const theme = useTheme();
  const scale   = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          ...spring.dialog,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          ...makeTimingConfig('fadeIn'),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.92,
          ...makeTimingConfig('fadeOut'),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          ...makeTimingConfig('fadeOut'),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  const confirmColor = destructive ? theme.negative : theme.tint;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={onCancel} />

      {/* Card */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.center,
          { opacity },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.bgElevated,
              borderWidth: 1,
              borderColor: theme.separatorOpaque,
              transform: [{ scale }],
            },
          ]}
        >
          {/* Text section */}
          <View style={styles.textSection}>
            <Text style={[styles.title, { color: theme.label }]}>{title}</Text>
            {description && (
              <Text style={[styles.description, { color: theme.labelSecondary }]}>
                {description}
              </Text>
            )}
          </View>

          <Divider />

          {/* Actions */}
          <View style={styles.actions}>
            {/* Cancel — left or top */}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.actionLabel, { color: theme.label }]}>
                {cancelLabel}
              </Text>
            </Pressable>

            <View style={[styles.verticalDivider, { backgroundColor: theme.separator }]} />

            {/* Confirm */}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionPressed,
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.actionLabel, styles.confirmLabel, { color: confirmColor }]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  textSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: calcLineHeight(fontSize.lg, 'snug'),
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: calcLineHeight(fontSize.sm, 'relaxed'),
  },
  actions: {
    flexDirection: 'row',
    minHeight: 44,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  actionPressed: {
    opacity: opacity.pressed,
  },
  actionLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  confirmLabel: {
    fontWeight: '500',
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
  },
});
