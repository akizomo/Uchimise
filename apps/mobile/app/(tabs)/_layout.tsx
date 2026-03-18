import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, BottomTabBar } from '@uchimise/ui';
import type { TabItem } from '@uchimise/ui';

export default function TabLayout() {
  const theme = useTheme();

  const TABS: TabItem[] = [
    {
      key: 'plan',
      label: '献立',
      icon: (isActive) => (
        <Ionicons
          name={isActive ? 'calendar' : 'calendar-outline'}
          size={20}
          color={isActive ? theme.navIconActive : theme.navIconInactive}
        />
      ),
    },
    {
      key: 'discover',
      label: '発見',
      icon: (isActive) => (
        <Ionicons
          name={isActive ? 'compass' : 'compass-outline'}
          size={20}
          color={isActive ? theme.navIconActive : theme.navIconInactive}
        />
      ),
    },
    {
      key: 'collections',
      label: 'コレクション',
      icon: (isActive) => (
        <Ionicons
          name={isActive ? 'albums' : 'albums-outline'}
          size={20}
          color={isActive ? theme.navIconActive : theme.navIconInactive}
        />
      ),
    },
    {
      key: 'me',
      label: '自分',
      icon: (isActive) => (
        <Ionicons
          name={isActive ? 'person' : 'person-outline'}
          size={20}
          color={isActive ? theme.navIconActive : theme.navIconInactive}
        />
      ),
    },
  ];

  return (
    <Tabs
      tabBar={(props) => {
        const activeKey = props.state.routes[props.state.index]?.name ?? 'plan';
        return (
          <BottomTabBar
            tabs={TABS}
            activeTab={activeKey}
            onTabPress={(key) => {
              const route = props.state.routes.find((r) => r.name === key);
              if (route) {
                props.navigation.navigate(route.name);
              }
            }}
          />
        );
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="collections" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
