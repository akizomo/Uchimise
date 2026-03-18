import React from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from '../../components/composed/EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Collection: Story = {
  render: () => (
    <EmptyState
      icon={<Text style={{ fontSize: 48 }}>🏪</Text>}
      title="まだ棚が空です。"
      description="SNSで見つけたレシピを、ここに並べてみませんか。"
    />
  ),
};

export const CookingHistory: Story = {
  render: () => (
    <EmptyState
      icon={<Text style={{ fontSize: 48 }}>🍳</Text>}
      title="調理の記録がまだありません。"
      description="作った料理がここに残っていきます。"
    />
  ),
};

export const SearchResults: Story = {
  render: () => (
    <EmptyState
      icon={<Text style={{ fontSize: 48 }}>🔍</Text>}
      title="「鶏むね肉」に合うレシピが見つかりませんでした。"
      description="別の言葉で探してみてください。"
    />
  ),
};

export const WithAction: Story = {
  render: () => (
    <EmptyState
      icon={<Text style={{ fontSize: 48 }}>🏪</Text>}
      title="まだ棚が空です。"
      description="SNSで見つけたレシピを、ここに並べてみませんか。"
      actionLabel="棚に保存する"
      onAction={() => {}}
    />
  ),
};

export const Discover: Story = {
  render: () => (
    <EmptyState
      icon={<Text style={{ fontSize: 48 }}>✨</Text>}
      title="あなたの棚、少しずつ充実させていきましょう。"
      description="レシピを保存するほど、あなたらしい棚になっていきます。"
    />
  ),
};
