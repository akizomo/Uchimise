import React, { useState } from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { BottomSheet } from '../../components/composed/BottomSheet';
import { Button } from '../../components/primitives/Button';
import { ListRow } from '../../components/composed/ListRow';
import { Switch } from '../../components/primitives/Switch';
import { spacing } from '@uchimise/tokens';

const meta: Meta<typeof BottomSheet> = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

function SheetDemo({ title, children }: { title?: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
      <Button label="シートを開く" variant="secondary" onPress={() => setVisible(true)} />
      <BottomSheet visible={visible} onClose={() => setVisible(false)} title={title} bottomInset={0}>
        {children}
      </BottomSheet>
    </View>
  );
}

export const ActionSheet: Story = {
  render: () => (
    <SheetDemo title="操作を選ぶ">
      <View style={{ paddingBottom: spacing.md }}>
        <ListRow title="動画で見る"       leading={<Text style={{ fontSize: 20 }}>▶️</Text>} trailing="chevron" onPress={() => {}} />
        <ListRow title="献立に入れる"     leading={<Text style={{ fontSize: 20 }}>📅</Text>} trailing="chevron" onPress={() => {}} />
        <ListRow title="シェアする"       leading={<Text style={{ fontSize: 20 }}>↗️</Text>}  trailing="chevron" onPress={() => {}} />
        <ListRow title="棚から取り出す"   leading={<Text style={{ fontSize: 20 }}>🗑️</Text>}  trailing="none" destructive onPress={() => {}} showDivider={false} />
      </View>
    </SheetDemo>
  ),
};

export const WithForm: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
        <Button label="設定を開く" variant="secondary" onPress={() => {}} />
        <BottomSheet visible title="通知設定" onClose={() => {}} bottomInset={0}>
          <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.md }}>
            <Switch label="保存完了の通知" value={checked} onValueChange={setChecked} />
            <Switch label="調理リマインダー" sublabel="設定した時間に届きます" value={false} onValueChange={() => {}} />
          </View>
        </BottomSheet>
      </View>
    );
  },
};
