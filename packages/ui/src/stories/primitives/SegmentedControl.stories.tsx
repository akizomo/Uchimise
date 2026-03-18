import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { SegmentedControl } from '../../components/primitives/SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Primitives/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Controlled({ options }: { options: string[] }) {
  const [value, setValue] = useState(options[0]);
  return <SegmentedControl options={options} value={value} onValueChange={setValue} />;
}

export const TwoOptions: Story = {
  render: () => <Controlled options={['保存済み', '全て']} />,
};

export const ThreeOptions: Story = {
  render: () => <Controlled options={['全て', '未確定', '確認済み']} />,
};

export const FourOptions: Story = {
  render: () => <Controlled options={['全て', '朝', '昼', '夜']} />,
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: spacing.xl }}>
      <Controlled options={['保存済み', '全て']} />
      <Controlled options={['全て', '未確定', '確認済み']} />
      <Controlled options={['全て', '朝', '昼', '夜']} />
    </View>
  ),
};
