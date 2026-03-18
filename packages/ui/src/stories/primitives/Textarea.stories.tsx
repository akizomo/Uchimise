import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { Textarea } from '../../components/primitives/Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

function Controlled(props: Omit<React.ComponentProps<typeof Textarea>, 'value' | 'onChangeText'>) {
  const [v, setV] = useState('');
  return <Textarea value={v} onChangeText={setV} {...props} />;
}

export const Default: Story = {
  render: () => <Controlled placeholder="次に作るときのメモ" />,
};

export const WithLabel: Story = {
  render: () => <Controlled label="メモ" placeholder="次に作るときのメモ" />,
};

export const WithCharCount: Story = {
  render: () => (
    <Controlled
      label="メモ"
      placeholder="次に作るときのメモ"
      maxLength={200}
    />
  ),
};

export const WithHelper: Story = {
  render: () => (
    <Controlled
      label="感想"
      placeholder="次に作るときのメモ"
      helper="調理後に思ったことを残しておくと次に役立ちます"
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <Textarea
      value="a"
      onChangeText={() => {}}
      label="メモ"
      error="うまく保存できませんでした。もう一度試してみてください。"
    />
  ),
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: spacing.xl }}>
      <Controlled label="通常" placeholder="次に作るときのメモ" />
      <Controlled label="文字数カウント付き" placeholder="感想" maxLength={200} rows={3} />
      <Textarea value="" onChangeText={() => {}} label="無効" placeholder="入力できません" disabled />
    </View>
  ),
};
