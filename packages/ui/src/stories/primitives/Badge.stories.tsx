import type { Meta, StoryObj } from '@storybook/react';

import { colors } from '@uchimise/tokens';

import { Badge } from '../../components/primitives/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
    backgroundColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const New: Story = {
  args: {
    label: 'NEW',
    color: colors.ivory,
    backgroundColor: colors.complement,
  },
};

export const Warning: Story = {
  args: {
    label: '未確認',
    color: colors.espresso,
    backgroundColor: colors.goldenrod,
  },
};

export const Confirmed: Story = {
  args: {
    label: '確認済み',
    color: colors.ivory,
    backgroundColor: colors.sage,
  },
};

export const Error: Story = {
  args: {
    label: 'エラー',
    color: colors.ivory,
    backgroundColor: colors.rust,
  },
};

export const Tint: Story = {
  args: {
    label: '保存済み',
    color: colors.espresso,
    backgroundColor: colors.ochre,
  },
};
