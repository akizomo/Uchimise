import type { Meta, StoryObj } from '@storybook/react';

import { CollectionCard } from '../../components/composed/CollectionCard';

const meta: Meta<typeof CollectionCard> = {
  title: 'Components/CollectionCard',
  component: CollectionCard,
  parameters: { layout: 'padded' },
  argTypes: {
    isAuto: { control: 'boolean' },
    recipeCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof CollectionCard>;

export const Default: Story = {
  args: {
    name: '平日の夜ごはん',
    recipeCount: 12,
    isAuto: false,
  },
};

export const Auto: Story = {
  args: {
    name: '今週のおすすめ',
    recipeCount: 5,
    isAuto: true,
  },
};

export const LongName: Story = {
  args: {
    name: 'とても長いコレクション名がここに入ったときの表示確認用サンプル',
    recipeCount: 3,
    isAuto: false,
  },
};

export const Empty: Story = {
  args: {
    name: '新しいコレクション',
    recipeCount: 0,
    isAuto: false,
  },
};
