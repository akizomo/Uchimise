import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { SearchBar } from '../../components/primitives/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Primitives/SearchBar',
  component: SearchBar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SearchBar>;

function Controlled(props: Partial<React.ComponentProps<typeof SearchBar>>) {
  const [value, setValue] = useState('');
  return (
    <SearchBar
      value={value}
      onChangeText={setValue}
      onClear={() => setValue('')}
      {...props}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithCancel: Story = {
  render: () => (
    <Controlled
      onCancel={() => {}}
    />
  ),
};

export const WithValue: Story = {
  render: () => {
    const [v, setV] = useState('とり肉');
    return (
      <SearchBar
        value={v}
        onChangeText={setV}
        onClear={() => setV('')}
      />
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <Controlled placeholder="レシピ・食材・気分で探す" />
      <Controlled placeholder="コレクションを探す" onCancel={() => {}} />
    </View>
  ),
};
