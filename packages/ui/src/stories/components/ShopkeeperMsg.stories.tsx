import type { Meta, StoryObj } from '@storybook/react';

import { ShopkeeperMsg } from '../../components/composed/ShopkeeperMsg';

const meta: Meta<typeof ShopkeeperMsg> = {
  title: 'Components/ShopkeeperMsg',
  component: ShopkeeperMsg,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ShopkeeperMsg>;

export const Default: Story = {
  args: {
    message: '冷蔵庫の鶏肉と大葉で、今夜はどうですか。',
    timestamp: '19:42',
    context: '今夜',
  },
};

export const NoMeta: Story = {
  args: {
    message: '週末に作り置きはいかがですか。',
  },
};
