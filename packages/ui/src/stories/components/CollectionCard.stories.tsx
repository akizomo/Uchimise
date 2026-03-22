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

export const WithThumbnails: Story = {
  args: {
    name: '週末の特別ごはん',
    recipeCount: 8,
    isAuto: false,
    thumbnailUrls: [
      'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg',
      'https://img.youtube.com/vi/BLm8eRqWX5s/hqdefault.jpg',
      'https://img.youtube.com/vi/CP9nFsWv74m/hqdefault.jpg',
      'https://img.youtube.com/vi/DQ7gHxUk82n/hqdefault.jpg',
    ],
  },
};

export const WithPartialThumbnails: Story = {
  args: {
    name: '試してみたいレシピ',
    recipeCount: 2,
    isAuto: false,
    thumbnailUrls: [
      'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg',
      'https://img.youtube.com/vi/BLm8eRqWX5s/hqdefault.jpg',
    ],
  },
};

export const Auto: Story = {
  args: {
    name: '店主おすすめ',
    recipeCount: 5,
    isAuto: true,
    thumbnailUrls: [
      'https://img.youtube.com/vi/FJ3nNwYk05p/hqdefault.jpg',
      'https://img.youtube.com/vi/GK4oQxL16q/hqdefault.jpg',
      'https://img.youtube.com/vi/HL5pRyM27r/hqdefault.jpg',
      'https://img.youtube.com/vi/LP9tVyQ61v/hqdefault.jpg',
    ],
  },
};

export const LongName: Story = {
  args: {
    name: 'とても長いコレクション名がここに入ったときの表示確認用サンプル',
    recipeCount: 3,
    isAuto: false,
    thumbnailUrls: [
      'https://img.youtube.com/vi/AKJtVpQnR3w/hqdefault.jpg',
    ],
  },
};

export const Empty: Story = {
  args: {
    name: '新しいコレクション',
    recipeCount: 0,
    isAuto: false,
  },
};
