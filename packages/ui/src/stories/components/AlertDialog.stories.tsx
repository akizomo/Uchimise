import React, { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { AlertDialog } from '../../components/composed/AlertDialog';
import { Button } from '../../components/primitives/Button';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  parameters: { layout: 'padded' },
  argTypes: {
    destructive: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

function DialogDemo({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
}: Partial<React.ComponentProps<typeof AlertDialog>>) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
      <Button label="確認ダイアログを開く" variant="secondary" onPress={() => setVisible(true)} />
      <AlertDialog
        visible={visible}
        title={title ?? ''}
        description={description}
        confirmLabel={confirmLabel ?? '実行する'}
        cancelLabel={cancelLabel}
        destructive={destructive}
        onConfirm={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      />
    </View>
  );
}

export const DeleteCollection: Story = {
  render: () => (
    <DialogDemo
      title="コレクションを削除しますか？"
      description="保存されているレシピは残ります。"
      confirmLabel="削除する"
      destructive
    />
  ),
};

export const RemoveRecipe: Story = {
  render: () => (
    <DialogDemo
      title="このレシピを棚から取り出しますか？"
      confirmLabel="取り出す"
      destructive
    />
  ),
};

export const DeleteRecord: Story = {
  render: () => (
    <DialogDemo
      title="この記録を消しますか？"
      description="一度消すと、もとに戻せません。"
      confirmLabel="記録を消す"
      destructive
    />
  ),
};

export const NonDestructive: Story = {
  render: () => (
    <DialogDemo
      title="変更を保存しますか？"
      description="入力した内容を棚に保存します。"
      confirmLabel="保存する"
      cancelLabel="そのままにする"
      destructive={false}
    />
  ),
};

export const AllDialogs: Story = {
  render: () => (
    <View style={{ gap: spacing.md }}>
      <DialogDemo title="コレクションを削除しますか？" description="保存されているレシピは残ります。" confirmLabel="削除する" destructive />
      <DialogDemo title="変更を保存しますか？" confirmLabel="保存する" cancelLabel="そのままにする" />
    </View>
  ),
};
