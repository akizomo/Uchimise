import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { SkeletonCard, SkeletonLoader, SkeletonText } from '../../components/primitives/SkeletonLoader';

const meta: Meta<typeof SkeletonLoader> = {
  title: 'Primitives/SkeletonLoader',
  component: SkeletonLoader,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SkeletonLoader>;

export const Single: Story = {
  render: () => <SkeletonLoader height={20} />,
};

export const TextLines: Story = {
  render: () => <SkeletonText lines={4} />,
};

export const CardSkeleton: Story = {
  render: () => <SkeletonCard />,
};

export const FeedSkeleton: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  ),
};

export const InlineRow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <SkeletonLoader width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, gap: spacing.sm }}>
        <SkeletonLoader height={14} width="70%" />
        <SkeletonLoader height={12} width="45%" />
      </View>
    </View>
  ),
};
