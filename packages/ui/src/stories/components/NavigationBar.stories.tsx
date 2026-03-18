import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { NavigationBar } from '../../components/composed/NavigationBar';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof NavigationBar> = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const TitleOnly: Story = {
  args: {
    title: 'レシピ',
  },
};

export const WithRightAction: Story = {
  args: {
    title: 'レシピを追加',
    rightAction: { label: '閉じる', onPress: () => {} },
  },
};

export const Discover: Story = {
  args: {
    title: '発見',
  },
};

export const Plan: Story = {
  args: {
    title: '献立',
  },
};

/** 複数パターンを縦に並べて比較 */
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <NavigationBar title="棚" />
      <NavigationBar title="レシピを追加" rightAction={{ label: '閉じる', onPress: () => {} }} />
      <NavigationBar title="コレクションを作成" rightAction={{ label: 'キャンセル', onPress: () => {} }} />
    </View>
  ),
};
