import React, { useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { fontFamily, fontSize, radius, spacing, spring } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface SegmentedControlProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  style,
}: SegmentedControlProps) {
  const theme        = useTheme();
  const selectedIdx  = options.indexOf(value);
  const [segWidth, setSegWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width / options.length;
    setSegWidth(w);
    pillX.setValue(w * Math.max(0, selectedIdx));
  };

  const handleSelect = (idx: number) => {
    Animated.spring(pillX, {
      toValue:         segWidth * idx,
      useNativeDriver: true,
      ...spring.gentle,
    }).start();
    onValueChange(options[idx]);
  };

  // sync pill when value changes externally
  React.useEffect(() => {
    if (segWidth > 0) {
      Animated.spring(pillX, {
        toValue:         segWidth * Math.max(0, selectedIdx),
        useNativeDriver: true,
        damping:         40,
        stiffness:       400,
      }).start();
    }
  }, [selectedIdx, segWidth, pillX]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.fillTertiary }, style]}
      onLayout={handleLayout}
    >
      {/* sliding pill */}
      {segWidth > 0 && (
        <Animated.View
          style={[
            styles.pill,
            {
              width:            segWidth - spacing.xs,
              backgroundColor:  theme.bgElevated,
              borderColor:      theme.separator,
              transform:        [{ translateX: pillX }],
            },
          ]}
        />
      )}

      {options.map((opt, idx) => {
        const active = idx === selectedIdx;
        return (
          <Pressable
            key={opt}
            style={styles.segment}
            onPress={() => handleSelect(idx)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.label,
                { color: active ? theme.label : theme.labelSecondary },
              ]}
              numberOfLines={1}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CONTROL_H = 36;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height:        CONTROL_H,
    borderRadius:  radius.sm,
    padding:       spacing.xxs,
    position:      'relative',
  },
  pill: {
    position:     'absolute',
    top:          spacing.xxs,
    left:         spacing.xxs / 2,
    height:       CONTROL_H - spacing.xxs * 2,
    borderRadius: radius.sm - 2,
    borderWidth:  0.5,
    // subtle drop shadow on pill
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  2,
    elevation:     1,
  },
  segment: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize:   fontSize.sm,
    fontWeight: '500',
  },
});
