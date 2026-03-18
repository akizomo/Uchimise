import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { Chip } from '../../components/primitives/Chip';

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Chip>;

const FILTERS = ['全て', '和食', '洋食', '中華', 'お菓子', '麺類', '汁物'];

export const Single: Story = {
  render: () => {
    const [sel, setSel] = useState(false);
    return <Chip label="和食" selected={sel} onPress={() => setSel(s => !s)} />;
  },
};

export const FilterRow: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['全て']);
    const toggle = (v: string) =>
      setSelected(prev =>
        prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
      );
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {FILTERS.map(f => (
          <Chip
            key={f}
            label={f}
            selected={selected.includes(f)}
            onPress={() => toggle(f)}
          />
        ))}
      </View>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Chip label="無効・未選択" disabled />
      <Chip label="無効・選択済み" selected disabled />
    </View>
  ),
};
