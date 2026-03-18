import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { RadioButton, RadioGroup } from '../../components/primitives/RadioButton';

const meta: Meta<typeof RadioButton> = {
  title: 'Primitives/RadioButton',
  component: RadioButton,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Single: Story = {
  render: () => {
    const [sel, setSel] = useState(false);
    return <RadioButton selected={sel} onPress={() => setSel(s => !s)} label="プッシュ通知を受け取る" />;
  },
};

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('newest');
    return (
      <RadioGroup
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'newest',   label: '新しい順' },
          { value: 'oldest',   label: '古い順' },
          { value: 'cooktime', label: '調理時間順', sublabel: '短い順に並べます' },
        ]}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      value="a"
      onValueChange={() => {}}
      disabled
      options={[
        { value: 'a', label: '選択済み（無効）' },
        { value: 'b', label: '未選択（無効）' },
      ]}
    />
  ),
};
