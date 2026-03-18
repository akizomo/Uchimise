import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Pencil,
  Share2,
  Trash2,
  X,
} from 'lucide-react-native';

import { spacing } from '@uchimise/tokens';

import { Icon } from '../../components/primitives/Icon';
import { IconButton } from '../../components/primitives/IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  argTypes: {
    size:     { control: 'select', options: ['sm', 'md', 'lg'] },
    variant:  { control: 'select', options: ['ghost', 'filled', 'tinted'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = {
  render: () => (
    <IconButton
      icon={<Icon as={Bookmark} size="md" color="primary" />}
      variant="ghost"
      size="md"
      accessibilityLabel="ブックマーク"
    />
  ),
};

export const Filled: Story = {
  render: () => (
    <IconButton
      icon={<Icon as={BookmarkCheck} size="md" color="primary" />}
      variant="filled"
      size="md"
      accessibilityLabel="保存済み"
    />
  ),
};

export const Tinted: Story = {
  render: () => (
    <IconButton
      icon={<Icon as={Share2} size="md" color="tint" />}
      variant="tinted"
      size="md"
      accessibilityLabel="シェア"
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
      <IconButton icon={<Icon as={Bookmark} size="sm" color="tint" />} size="sm" variant="tinted" accessibilityLabel="sm" />
      <IconButton icon={<Icon as={Bookmark} size="md" color="tint" />} size="md" variant="tinted" accessibilityLabel="md" />
      <IconButton icon={<Icon as={Bookmark} size="lg" color="tint" />} size="lg" variant="tinted" accessibilityLabel="lg" />
    </View>
  ),
};

export const Disabled: Story = {
  render: () => (
    <IconButton
      icon={<Icon as={X} size="md" color="primary" />}
      variant="ghost"
      size="md"
      disabled
      accessibilityLabel="閉じる"
    />
  ),
};

export const ActionRow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <IconButton icon={<Icon as={ChevronLeft} size="md" color="primary" />} variant="ghost" size="md" accessibilityLabel="戻る" />
      <IconButton icon={<Icon as={Pencil}      size="md" color="tint"    />} variant="tinted" size="md" accessibilityLabel="編集" />
      <IconButton icon={<Icon as={Share2}      size="md" color="tint"    />} variant="tinted" size="md" accessibilityLabel="シェア" />
      <IconButton icon={<Icon as={Trash2}      size="md" color="negative"/>} variant="ghost"  size="md" accessibilityLabel="削除" />
    </View>
  ),
};
