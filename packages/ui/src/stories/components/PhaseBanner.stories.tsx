import type { Meta, StoryObj } from '@storybook/react';

import { PhaseBanner } from '../../components/composed/PhaseBanner';

const meta: Meta<typeof PhaseBanner> = {
  title: 'Components/PhaseBanner',
  component: PhaseBanner,
  parameters: { layout: 'padded' },
  argTypes: {
    visible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PhaseBanner>;

export const Visible: Story = { args: { visible: true } };
export const Hidden: Story = { args: { visible: false } };
