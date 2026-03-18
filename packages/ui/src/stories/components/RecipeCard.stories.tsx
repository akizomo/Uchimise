import type { Meta, StoryObj } from '@storybook/react';

import { RecipeCard } from '../../components/composed/RecipeCard';

const meta: Meta<typeof RecipeCard> = {
  title: 'Components/RecipeCard',
  component: RecipeCard,
  parameters: { layout: 'padded' },
  argTypes: {
    isSaved: { control: 'boolean' },
    isUnconfirmed: { control: 'boolean' },
    sourceType: { control: 'select', options: ['youtube', 'instagram'] },
  },
};

export default meta;
type Story = StoryObj<typeof RecipeCard>;

export const Default: Story = {
  args: {
    title: '鶏もも肉と大葉のさっぱり炒め',
    creatorName: '料理チャンネル山田',
    cookTimeMinutes: 20,
    sourceType: 'youtube',
    isSaved: false,
    isUnconfirmed: false,
  },
};

export const Saved: Story = {
  args: { ...Default.args, isSaved: true },
};

export const Unconfirmed: Story = {
  args: { ...Default.args, isUnconfirmed: true },
};

export const Instagram: Story = {
  args: { ...Default.args, sourceType: 'instagram' },
};
