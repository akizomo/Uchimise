import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { fontFamily, fontSize } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Remote image URI */
  uri?: string;
  /** Displayed as initials when uri is absent */
  name?: string;
  size?: AvatarSize;
}

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

const FONT_SIZE: Record<AvatarSize, number> = {
  xs: fontSize.xs,
  sm: fontSize.sm,
  md: fontSize.md,
  lg: fontSize.xl,
  xl: fontSize.xxl,
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const theme = useTheme();
  const px = SIZE_PX[size];

  const containerStyle = {
    width: px,
    height: px,
    borderRadius: px / 2,
    backgroundColor: theme.fillPrimary,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[containerStyle, styles.image]}
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View style={[styles.fallback, containerStyle]}>
      <Text
        style={[
          styles.initials,
          { color: theme.tint, fontSize: FONT_SIZE[size] },
        ]}
      >
        {name ? initials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.display,
    fontWeight: '600',
  },
});
