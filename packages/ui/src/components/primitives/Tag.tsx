import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type TagVariant = 'time' | 'source' | 'saved' | 'unconfirmed' | 'confirmed' | 'new';

export interface TagProps {
  label: string;
  variant?: TagVariant;
  icon?: React.ReactNode;
}

function getVariantStyle(variant: TagVariant, theme: ReturnType<typeof useTheme>) {
  switch (variant) {
    case 'time':
      return { bg: 'transparent',    border: theme.separator,      text: theme.labelSecondary };
    case 'source':
      return { bg: 'transparent',    border: theme.separator,      text: theme.labelTertiary  };
    case 'saved':
      return { bg: theme.tintSubtle, border: theme.tint,           text: theme.tint           };
    case 'unconfirmed':
      return { bg: theme.warningBg,  border: theme.warningBorder,  text: theme.warningText    };
    case 'confirmed':
      return { bg: theme.positiveBg, border: theme.positiveBorder, text: theme.positive       };
    case 'new':
      return { bg: theme.accentBg,   border: theme.accentBorder,   text: theme.accent         };
  }
}

export function Tag({ label, variant = 'time', icon }: TagProps) {
  const theme = useTheme();
  const variantStyle = getVariantStyle(variant, theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
        },
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, { color: variantStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
  },
});
