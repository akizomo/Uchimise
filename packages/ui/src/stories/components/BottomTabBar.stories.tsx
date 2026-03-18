import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { CalendarDays, Compass, BookMarked, User } from 'lucide-react-native';

import { BottomTabBar } from '../../components/composed/BottomTabBar';
import { Icon } from '../../components/primitives/Icon';
import { useTheme } from '../../hooks/useTheme';

function TabBarWithTheme({ activeTab, onTabPress }: { activeTab: string; onTabPress: (k: string) => void }) {
  const theme = useTheme();

  const TABS = [
    { key: 'plan',        label: '献立',       icon: (isActive: boolean) => <Icon as={CalendarDays} size="md" color={isActive ? theme.navIconActive : theme.navIconInactive} /> },
    { key: 'discover',    label: '発見',       icon: (isActive: boolean) => <Icon as={Compass}      size="md" color={isActive ? theme.navIconActive : theme.navIconInactive} /> },
    { key: 'collections', label: 'コレクション', icon: (isActive: boolean) => <Icon as={BookMarked}  size="md" color={isActive ? theme.navIconActive : theme.navIconInactive} /> },
    { key: 'me',          label: '自分',       icon: (isActive: boolean) => <Icon as={User}         size="md" color={isActive ? theme.navIconActive : theme.navIconInactive} /> },
  ];

  return <BottomTabBar tabs={TABS} activeTab={activeTab} onTabPress={onTabPress} />;
}

const meta: Meta<typeof BottomTabBar> = {
  title: 'Components/BottomTabBar',
  component: BottomTabBar,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BottomTabBar>;

export const PlanActive: Story = {
  render: () => <TabBarWithTheme activeTab="plan" onTabPress={() => {}} />,
};

export const DiscoverActive: Story = {
  render: () => <TabBarWithTheme activeTab="discover" onTabPress={() => {}} />,
};

export const CollectionsActive: Story = {
  render: () => <TabBarWithTheme activeTab="collections" onTabPress={() => {}} />,
};

export const MeActive: Story = {
  render: () => <TabBarWithTheme activeTab="me" onTabPress={() => {}} />,
};

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState('plan');
    return <TabBarWithTheme activeTab={active} onTabPress={setActive} />;
  },
};
