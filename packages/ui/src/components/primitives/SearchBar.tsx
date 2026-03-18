import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

import { fontFamily, fontSize, opacity, radius, spacing, spring } from '@uchimise/tokens';
import { Icon } from './Icon';

import { useTheme } from '../../hooks/useTheme';
import { makeTimingConfig } from '../../motion';

export interface SearchBarProps
  extends Pick<
    RNTextInputProps,
    | 'value'
    | 'onChangeText'
    | 'onSubmitEditing'
    | 'autoFocus'
    | 'onFocus'
    | 'onBlur'
  > {
  placeholder?: string;
  onClear?: () => void;
  /** Show a "キャンセル" text button that dismisses the bar */
  cancelLabel?: string;
  onCancel?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  value = '',
  onChangeText,
  onSubmitEditing,
  autoFocus,
  placeholder = 'レシピ・食材・気分で探す',
  onClear,
  cancelLabel = 'キャンセル',
  onCancel,
  onFocus,
  onBlur,
  style,
}: SearchBarProps) {
  const theme     = useTheme();
  const inputRef  = useRef<RNTextInput>(null);
  const [focused, setFocused] = useState(false);
  const cancelW   = useRef(new Animated.Value(0)).current;
  const cancelO   = useRef(new Animated.Value(0)).current;

  const showCancel = onCancel !== undefined;

  const handleFocus: RNTextInputProps['onFocus'] = (e) => {
    setFocused(true);
    if (showCancel) {
      Animated.parallel([
        Animated.spring(cancelW, { toValue: 1, useNativeDriver: false, ...spring.cancel }),
        Animated.timing(cancelO, { toValue: 1, useNativeDriver: false, ...makeTimingConfig('fadeIn') }),
      ]).start();
    }
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps['onBlur'] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleCancel = () => {
    Animated.parallel([
      Animated.spring(cancelW, { toValue: 0, useNativeDriver: false, ...spring.cancel }),
      Animated.timing(cancelO, { toValue: 0, useNativeDriver: false, ...makeTimingConfig('micro') }),
    ]).start();
    inputRef.current?.blur();
    onCancel?.();
  };

  const borderColor = focused ? theme.tint : 'transparent';

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.fillSecondary,
            borderColor,
          },
        ]}
      >
        <Icon as={Search} size="sm" color="tertiary" />

        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor={theme.labelPlaceholder}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            { color: theme.label, fontFamily: fontFamily.body },
            { outlineWidth: 0 } as object,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {value.length > 0 && (
          <Pressable
            onPress={() => { onClear?.(); onChangeText?.(''); }}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? opacity.pressed : 1 })}
          >
            <Icon as={X} size="sm" color="tertiary" />
          </Pressable>
        )}
      </View>

      {showCancel && (
        <Animated.View
          style={{
            opacity: cancelO,
            maxWidth: cancelW.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }),
            overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? opacity.pressed : 1 }]}
          >
            <Text style={[styles.cancelLabel, { color: theme.tint }]}>{cancelLabel}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  inputContainer: {
    flex:             1,
    flexDirection:    'row',
    alignItems:       'center',
    borderRadius:     radius.pill,
    borderWidth:      1.5,
    paddingHorizontal: spacing.md,
    height:           40,
    gap:              spacing.sm,
  },
  input: {
    flex:     1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  cancelBtn: {
    paddingLeft: spacing.xs,
    height:      40,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.md,
  },
});
