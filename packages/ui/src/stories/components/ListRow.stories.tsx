import React from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { ListRow } from '../../components/composed/ListRow';
import { useTheme } from '../../hooks/useTheme';
import { colors, radius, spacing } from '@uchimise/tokens';

const meta: Meta<typeof ListRow> = {
  title: 'Components/ListRow',
  component: ListRow,
  parameters: { layout: 'padded' },
  argTypes: {
    trailing:      { control: 'select', options: ['chevron', 'none'] },
    destructive:   { control: 'boolean' },
    showDivider:   { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof ListRow>;

export const Default: Story = {
  args: { title: '設定', trailing: 'chevron', onPress: () => {} },
};

export const WithSubtitle: Story = {
  args: { title: 'アカウント', subtitle: 'account@example.com', trailing: 'chevron', onPress: () => {} },
};

export const WithLeadingIcon: Story = {
  args: {
    title: 'プッシュ通知',
    leading: <Text style={{ fontSize: 20 }}>🔔</Text>,
    trailing: 'chevron',
    onPress: () => {},
  },
};

export const Destructive: Story = {
  args: { title: 'コレクションを削除する', trailing: 'none', destructive: true, onPress: () => {} },
};

export const StaticRow: Story = {
  args: { title: 'バージョン', trailing: <Text style={{ color: colors.mist }}>1.0.0</Text>, showDivider: false },
};

export const GroupedList: Story = {
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: theme.bgGroupedSecondary }}>
        <ListRow title="アカウント"    subtitle="account@example.com" leading={<Text style={{ fontSize: 20 }}>👤</Text>} trailing="chevron" onPress={() => {}} />
        <ListRow title="通知"          leading={<Text style={{ fontSize: 20 }}>🔔</Text>} trailing="chevron" onPress={() => {}} />
        <ListRow title="プライバシー"  leading={<Text style={{ fontSize: 20 }}>🔒</Text>} trailing="chevron" onPress={() => {}} />
        <ListRow title="ヘルプ"        leading={<Text style={{ fontSize: 20 }}>❓</Text>} trailing="chevron" onPress={() => {}} showDivider={false} />
      </View>
    );
  },
};

export const DestructiveGroup: Story = {
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: spacing.md }}>
        <View style={{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: theme.bgGroupedSecondary }}>
          <ListRow title="ログアウト" trailing="none" onPress={() => {}} showDivider={false} />
        </View>
        <View style={{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: theme.bgGroupedSecondary }}>
          <ListRow title="アカウントを削除する" trailing="none" destructive onPress={() => {}} showDivider={false} />
        </View>
      </View>
    );
  },
};
