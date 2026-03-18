import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, opacity, radius, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface TextInputProps
  extends Pick<
    RNTextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'secureTextEntry'
    | 'multiline'
    | 'numberOfLines'
    | 'keyboardType'
    | 'autoCapitalize'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'autoFocus'
    | 'maxLength'
    | 'onBlur'
    | 'onFocus'
  > {
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  /** Right-side accessory (e.g. clear button, eye icon) */
  trailing?: React.ReactNode;
  style?: ViewStyle;
}

export function TextInput({
  label,
  error,
  helper,
  disabled = false,
  trailing,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  // borderWidth は常に 1.5 で固定しレイアウトシフトを防ぐ。色だけ変える。
  const borderColor = error
    ? theme.negativeBorder
    : focused
    ? theme.tint
    : theme.separator;

  const handleFocus: RNTextInputProps['onFocus'] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps['onBlur'] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.labelSecondary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.bgSecondary,
            borderColor,
          },
          disabled && styles.disabled,
        ]}
      >
        <RNTextInput
          style={[
            styles.input,
            { color: theme.label, fontFamily: fontFamily.body },
            inputProps.multiline && styles.multiline,
            // react-native-web でブラウザのデフォルト focus outline を除去。
            // 外側コンテナの borderColor 変化のみでフォーカスを表現する。
            // RN ネイティブでは無視される。
            { outlineWidth: 0 } as object,
          ]}
          placeholderTextColor={theme.labelPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...inputProps}
        />
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? theme.negative : theme.labelTertiary },
          ]}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  trailing: {
    marginLeft: spacing.sm,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  helperText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});
