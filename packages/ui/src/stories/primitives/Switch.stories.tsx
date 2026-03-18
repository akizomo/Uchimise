import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from '../../components/primitives/Switch';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

function Controlled(props: Omit<React.ComponentProps<typeof Switch>, 'value' | 'onValueChange'>) {
  const [value, setValue] = useState(false);
  return <Switch value={value} onValueChange={setValue} {...props} />;
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="通知を受け取る" />,
};

export const WithSublabel: Story = {
  render: () => (
    <Controlled
      label="プッシュ通知"
      sublabel="調理完了や保存時に通知します"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <View style={{ gap: spacing.md }}>
      <Switch value={false} onValueChange={() => {}} label="オフ（無効）" disabled />
      <Switch value={true}  onValueChange={() => {}} label="オン（無効）"  disabled />
    </View>
  ),
};

export const Group: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <Controlled label="レシピ保存の通知" />
      <Controlled label="献立のリマインダー" sublabel="設定した時間に通知します" />
      <Controlled label="おすすめレシピ" sublabel="週1回、棚に合わせて届きます" />
    </View>
  ),
};
