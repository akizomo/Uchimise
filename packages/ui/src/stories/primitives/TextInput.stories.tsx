import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '../../components/primitives/TextInput';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof TextInput> = {
  title: 'Primitives/TextInput',
  component: TextInput,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof TextInput>;

function Controlled(props: Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText'>) {
  const [value, setValue] = useState('');
  return <TextInput value={value} onChangeText={setValue} {...props} />;
}

export const Default: Story = {
  render: () => <Controlled placeholder="レシピ名を入力" />,
};

export const WithLabel: Story = {
  render: () => (
    <Controlled
      label="レシピ名"
      placeholder="例：鶏むね肉のレモンソテー"
    />
  ),
};

export const WithHelper: Story = {
  render: () => (
    <Controlled
      label="メモ"
      placeholder="次に作るときのメモ"
      helper="調理時のコツや分量の調整を書いておくと便利です"
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <Controlled
      label="URL"
      placeholder="https://..."
      error="URLの形式が正しくありません。確認してみてください。"
    />
  ),
};

export const Multiline: Story = {
  render: () => (
    <Controlled
      label="メモ"
      placeholder="次に作るときのメモ"
      multiline
      numberOfLines={4}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <TextInput
      value="変更できません"
      onChangeText={() => {}}
      label="ステータス"
      disabled
    />
  ),
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <Controlled label="通常" placeholder="テキストを入力" />
      <Controlled label="エラー" placeholder="テキストを入力" error="入力内容を確認してください" />
      <Controlled label="ヘルパー付き" placeholder="テキストを入力" helper="補足テキストが入ります" />
      <TextInput value="無効" onChangeText={() => {}} label="無効" disabled />
    </View>
  ),
};
