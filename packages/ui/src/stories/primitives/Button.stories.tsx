import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../components/primitives/Button';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant:   { control: 'select', options: ['primary', 'secondary'] },
    disabled:  { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: '棚に保存する', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'あとで設定する', variant: 'secondary' },
};

export const Disabled: Story = {
  args: { label: '棚に保存する', variant: 'primary', disabled: true },
};

export const DisabledSecondary: Story = {
  args: { label: 'あとで設定する', variant: 'secondary', disabled: true },
};

/** 両バリアントを並べて比較 */
export const BothVariants: Story = {
  render: () => (
    <View style={{ gap: spacing.md, alignItems: 'center' }}>
      <Button label="調理する"       variant="primary" />
      <Button label="あとで設定する" variant="secondary" />
    </View>
  ),
};

export const Loading: Story = {
  args: { label: '調理する', variant: 'primary', isLoading: true },
};

export const LoadingSecondary: Story = {
  args: { label: '棚に保存する', variant: 'secondary', isLoading: true },
};

/** pressed / disabled / loading の各状態を視覚確認 */
export const States: Story = {
  render: () => (
    <View style={{ gap: spacing.sm, alignItems: 'center' }}>
      <Button label="通常 — Primary"    variant="primary" />
      <Button label="無効 — Primary"    variant="primary"   disabled />
      <Button label="読み込み中 — Primary"  variant="primary"   isLoading />
      <Button label="通常 — Secondary"  variant="secondary" />
      <Button label="無効 — Secondary"  variant="secondary" disabled />
      <Button label="読み込み中 — Secondary" variant="secondary" isLoading />
    </View>
  ),
};
