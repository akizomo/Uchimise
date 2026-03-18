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

export interface TextareaProps
  extends Pick<
    RNTextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'autoCapitalize'
    | 'autoFocus'
    | 'maxLength'
    | 'onBlur'
    | 'onFocus'
  > {
  label?: string;
  error?: string;
  helper?: string;
  /** Visible rows — controls minHeight. Default: 4 */
  rows?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

const LINE_H = 22; // approximate line height per row

export function Textarea({
  label,
  error,
  helper,
  rows = 4,
  disabled = false,
  onFocus,
  onBlur,
  style,
  maxLength,
  value = '',
  ...inputProps
}: TextareaProps) {
  const theme   = useTheme();
  const [focused, setFocused] = useState(false);

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
            minHeight: spacing.md * 2 + rows * LINE_H,
          },
          disabled && styles.disabled,
        ]}
      >
        <RNTextInput
          value={value}
          maxLength={maxLength}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            { color: theme.label, fontFamily: fontFamily.body },
            { outlineWidth: 0 } as object,
          ]}
          placeholderTextColor={theme.labelPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...inputProps}
        />
      </View>

      <View style={styles.footer}>
        {(error || helper) ? (
          <Text
            style={[
              styles.helper,
              { color: error ? theme.negative : theme.labelTertiary },
            ]}
          >
            {error ?? helper}
          </Text>
        ) : (
          <View />
        )}

        {maxLength !== undefined && (
          <Text style={[styles.counter, { color: theme.labelTertiary }]}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
  },
  inputContainer: {
    borderRadius:     radius.md,
    borderWidth:      1.5,
    paddingHorizontal: spacing.md,
    paddingVertical:  spacing.md,
  },
  input: {
    fontSize:   fontSize.md,
    lineHeight: LINE_H,
    padding:    0,
  },
  disabled: {
    opacity: opacity.disabled,
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  helper: {
    flex:       1,
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
  },
  counter: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
  },
});
