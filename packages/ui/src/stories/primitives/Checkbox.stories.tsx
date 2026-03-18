import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { Checkbox } from '../../components/primitives/Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

function Controlled(props: Omit<React.ComponentProps<typeof Checkbox>, 'value' | 'onValueChange'>) {
  const [v, setV] = useState(false);
  return <Checkbox value={v} onValueChange={setV} {...props} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="材料を揃えた" />,
};

export const WithSublabel: Story = {
  render: () => <Controlled label="玉ねぎ 1個" sublabel="みじん切りにする" />,
};

export const Disabled: Story = {
  render: () => (
    <View style={{ gap: spacing.md }}>
      <Checkbox value={false} onValueChange={() => {}} label="未選択（無効）" disabled />
      <Checkbox value={true}  onValueChange={() => {}} label="選択済み（無効）" disabled />
    </View>
  ),
};

export const IngredientList: Story = {
  render: () => {
    const items = [
      { label: '鶏もも肉', sublabel: '300g・一口大に切る' },
      { label: '玉ねぎ',   sublabel: '1個・薄切り' },
      { label: 'にんにく', sublabel: '2片・みじん切り' },
      { label: '醤油',     sublabel: '大さじ2' },
    ];
    const [checked, setChecked] = useState<Record<number, boolean>>({});
    return (
      <View style={{ gap: spacing.lg }}>
        {items.map((item, i) => (
          <Checkbox
            key={i}
            value={!!checked[i]}
            onValueChange={v => setChecked(prev => ({ ...prev, [i]: v }))}
            label={item.label}
            sublabel={item.sublabel}
          />
        ))}
      </View>
    );
  },
};
