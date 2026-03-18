import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { spacing } from '@uchimise/tokens';
import { ProgressBar } from '../../components/primitives/ProgressBar';
import { useTheme } from '../../hooks/useTheme';

const meta: Meta<typeof ProgressBar> = {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  render: () => <ProgressBar value={0.6} />,
};

export const AllVariants: Story = {
  render: () => {
    const theme = useTheme();
    const rows: { label: string; value: number; variant: React.ComponentProps<typeof ProgressBar>['variant'] }[] = [
      { label: 'default',  value: 0.7, variant: 'default'  },
      { label: 'positive', value: 0.9, variant: 'positive' },
      { label: 'warning',  value: 0.5, variant: 'warning'  },
      { label: 'negative', value: 0.3, variant: 'negative' },
    ];
    return (
      <View style={{ gap: spacing.lg }}>
        {rows.map(r => (
          <View key={r.label} style={{ gap: spacing.xs }}>
            <Text style={{ color: theme.labelSecondary, fontSize: 12 }}>{r.label}</Text>
            <ProgressBar value={r.value} variant={r.variant} />
          </View>
        ))}
      </View>
    );
  },
};

export const Animated: Story = {
  render: () => {
    const [v, setV] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setV(p => p >= 1 ? 0 : p + 0.1), 600);
      return () => clearInterval(t);
    }, []);
    return <ProgressBar value={v} height={8} />;
  },
};

export const Heights: Story = {
  render: () => (
    <View style={{ gap: spacing.lg }}>
      <ProgressBar value={0.65} height={4} />
      <ProgressBar value={0.65} height={6} />
      <ProgressBar value={0.65} height={10} />
    </View>
  ),
};
