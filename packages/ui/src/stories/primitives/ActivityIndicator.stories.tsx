import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { ActivityIndicator } from '../../components/primitives/ActivityIndicator';

const meta: Meta<typeof ActivityIndicator> = {
  title: 'Primitives/ActivityIndicator',
  component: ActivityIndicator,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ActivityIndicator>;

export const Small: Story = {
  render: () => <ActivityIndicator size="small" />,
};

export const Large: Story = {
  render: () => <ActivityIndicator size="large" />,
};

export const WithLabel: Story = {
  render: () => <ActivityIndicator size="large" label="材料と手順を整理しています…" />,
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: spacing.xxl, alignItems: 'center' }}>
      <ActivityIndicator size="small" />
      <ActivityIndicator size="large" />
      <ActivityIndicator size="large" label="材料と手順を整理しています…" />
    </View>
  ),
};
