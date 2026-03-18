import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { Stepper } from '../../components/primitives/Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Primitives/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

function Controlled(props: Omit<React.ComponentProps<typeof Stepper>, 'value' | 'onValueChange'>) {
  const [v, setV] = useState(props.min ?? 1);
  return <Stepper value={v} onValueChange={setV} {...props} />;
}

export const Default: Story = {
  render: () => <Controlled min={1} max={10} />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="人数" min={1} max={10} />,
};

export const ServingsGroup: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <Controlled label="人数" min={1} max={10} />
      <Controlled label="倍量" min={1} max={5}  />
    </View>
  ),
};

export const AtBoundaries: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <Stepper value={1}  onValueChange={() => {}} label="最小値" min={1} max={5} />
      <Stepper value={5}  onValueChange={() => {}} label="最大値" min={1} max={5} />
    </View>
  ),
};
