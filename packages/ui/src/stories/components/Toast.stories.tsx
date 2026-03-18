import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Toast, ToastVariant } from '../../components/composed/Toast';
import { Button } from '../../components/primitives/Button';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Toast>;

function ToastDemo({ variant, message }: { variant: ToastVariant; message: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        label="表示する"
        variant="secondary"
        onPress={() => setVisible(true)}
      />
      <Toast
        message={message}
        variant={variant}
        visible={visible}
        duration={3000}
        onHide={() => setVisible(false)}
      />
    </View>
  );
}

export const Default: Story = {
  render: () => (
    <ToastDemo variant="default" message="レシピを棚においておきました。" />
  ),
};

export const Positive: Story = {
  render: () => (
    <ToastDemo variant="positive" message="材料と手順が整理されました。" />
  ),
};

export const Negative: Story = {
  render: () => (
    <ToastDemo variant="negative" message="うまく保存できませんでした。もう一度試してみてください。" />
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastDemo variant="warning" message="この投稿は非公開のようです。URLのみ保存しておきました。" />
  ),
};

export const AllVariants: Story = {
  render: () => {
    const variants: { variant: ToastVariant; message: string }[] = [
      { variant: 'default',  message: 'レシピを棚においておきました。' },
      { variant: 'positive', message: '材料と手順が整理されました。' },
      { variant: 'negative', message: 'うまく保存できませんでした。' },
      { variant: 'warning',  message: 'URLのみ保存しておきました。' },
    ];
    return (
      <View style={{ gap: spacing.sm, padding: spacing.xl }}>
        {variants.map(({ variant, message }) => (
          <Toast key={variant} message={message} variant={variant} visible duration={0} />
        ))}
      </View>
    );
  },
};
