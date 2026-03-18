import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '../../components/primitives/Tag';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['time', 'source', 'saved', 'unconfirmed', 'confirmed', 'new'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Time: Story = { args: { label: '⏱ 20分', variant: 'time' } };
export const Source: Story = { args: { label: 'YouTube', variant: 'source' } };
export const Saved: Story = { args: { label: '保存済み', variant: 'saved' } };
export const Unconfirmed: Story = { args: { label: '未確認', variant: 'unconfirmed' } };
export const Confirmed: Story = { args: { label: '確認済み', variant: 'confirmed' } };
export const New: Story = { args: { label: 'NEW', variant: 'new' } };
