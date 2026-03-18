import React from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '../../components/primitives/Avatar';
import { fontSize, spacing } from '@uchimise/tokens';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: { name: '山田 太郎', size: 'md' },
};

export const SingleName: Story = {
  args: { name: '料理上手', size: 'md' },
};

export const Fallback: Story = {
  args: { size: 'md' },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <View key={size} style={{ alignItems: 'center', gap: spacing.xs }}>
          <Avatar name="鈴木 花子" size={size} />
          <Text style={{ fontSize: fontSize.xs }}>{size}</Text>
        </View>
      ))}
    </View>
  ),
};
