import React from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from '../../components/primitives/Divider';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
  argTypes: {
    inset: { control: { type: 'range', min: 0, max: 80, step: 4 } },
  },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: (args) => (
    <View>
      <Text style={{ padding: spacing.md }}>上のテキスト</Text>
      <Divider {...args} />
      <Text style={{ padding: spacing.md }}>下のテキスト</Text>
    </View>
  ),
};

export const Inset: Story = {
  args: { inset: spacing.xl },
  render: (args) => (
    <View>
      <Text style={{ padding: spacing.md }}>インセット付き（左インデント）</Text>
      <Divider {...args} />
      <Text style={{ padding: spacing.md }}>リスト行の区切り線に使用する形式</Text>
    </View>
  ),
};
