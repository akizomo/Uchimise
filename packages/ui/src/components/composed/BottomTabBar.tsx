import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';

export interface TabItem {
  key: string;
  label: string;
  /**
   * active 状態を受け取る render function。
   * @example
   * icon: (isActive) => <Icon as={House} size="md" color={isActive ? theme.navIconActive : theme.navIconInactive} />
   */
  icon: (isActive: boolean) => React.ReactNode;
}

export interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgNav, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const labelColor = isActive ? theme.navLabelActive : theme.navLabelInactive;

        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {tab.icon(isActive)}
            <Text style={[styles.label, { color: labelColor }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
  },
});
