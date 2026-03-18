import React, { useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Settings, Search, MoreVertical } from 'lucide-react-native';

import type { Meta, StoryObj } from '@storybook/react';
import { spacing } from '@uchimise/tokens';

import { AppBar } from '../../components/composed/AppBar';
import { Icon } from '../../components/primitives/Icon';

const meta: Meta<typeof AppBar> = {
  title: 'Components/AppBar',
  component: AppBar,
  parameters: { layout: 'padded' },
  argTypes: {
    variant:      { control: 'select', options: ['small', 'centerAligned', 'medium', 'large'] },
    title:        { control: 'text' },
    backAction:   { control: false },
    trailingIcons: { control: false },
    scrollY:      { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

// ── Small ──────────────────────────────────────────────────────────────────────

export const SmallDefault: Story = {
  args: { title: 'レシピ', variant: 'small' },
};

export const SmallWithBack: Story = {
  args: {
    title: '鶏むね肉の照り焼き',
    variant: 'small',
    backAction: () => {},
  },
};

export const SmallWithCloseLabel: Story = {
  args: {
    title: 'レシピを保存',
    variant: 'small',
    trailingIcons: [{ label: 'やめる', onPress: () => {} }],
  },
};

export const SmallWithIcons: Story = {
  args: {
    title: 'コレクション',
    variant: 'small',
    trailingIcons: [
      { icon: <Icon as={Search} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: '検索' },
      { icon: <Icon as={Settings} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: '設定' },
    ],
  },
};

export const SmallWithThreeIcons: Story = {
  args: {
    title: '棚',
    variant: 'small',
    trailingIcons: [
      { icon: <Icon as={Search} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: '検索' },
      { icon: <Icon as={Settings} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: '設定' },
      { icon: <Icon as={MoreVertical} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: 'メニュー' },
    ],
  },
};

// ── Center-aligned ─────────────────────────────────────────────────────────────

export const CenterAlignedDefault: Story = {
  args: { title: 'レシピを保存', variant: 'centerAligned' },
};

export const CenterAlignedWithBack: Story = {
  args: {
    title: '詳細',
    variant: 'centerAligned',
    backAction: () => {},
  },
};

export const CenterAlignedWithAction: Story = {
  args: {
    title: 'レシピを保存',
    variant: 'centerAligned',
    trailingIcons: [{ icon: <Icon as={MoreVertical} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: 'メニュー' }],
  },
};

// ── Medium (scroll で collapse) ────────────────────────────────────────────────

export const MediumDefault: Story = {
  args: { title: 'コレクション', variant: 'medium' },
};

/** scrollY = 48 → 完全 collapse した状態 */
export const MediumCollapsed: Story = {
  render: () => {
    const scrollY = useRef(new Animated.Value(48)).current;
    return <AppBar title="コレクション" variant="medium" scrollY={scrollY} />;
  },
};

export const MediumInteractive: Story = {
  render: () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const onScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    );
    return (
      <View style={styles.wrapper}>
        <AppBar
          title="コレクション"
          variant="medium"
          scrollY={scrollY}
          trailingIcons={[
            { icon: <Icon as={Settings} size="md" color="secondary" />, onPress: () => {}, accessibilityLabel: '設定' },
          ]}
        />
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardText}>アイテム {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  },
};

// ── Large (scroll で collapse) ─────────────────────────────────────────────────

export const LargeDefault: Story = {
  args: { title: '棚', variant: 'large' },
};

/** scrollY = 60 → 完全 collapse した状態 */
export const LargeCollapsed: Story = {
  render: () => {
    const scrollY = useRef(new Animated.Value(60)).current;
    return <AppBar title="棚" variant="large" scrollY={scrollY} />;
  },
};

export const LargeInteractive: Story = {
  render: () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const onScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    );
    return (
      <View style={styles.wrapper}>
        <AppBar
          title="発見"
          variant="large"
          scrollY={scrollY}
          trailingIcons={[
            { label: '編集', onPress: () => {} },
          ]}
        />
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardText}>レシピ {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  },
};

export const LargeInteractiveWithBack: Story = {
  render: () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const onScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    );
    return (
      <View style={styles.wrapper}>
        <AppBar
          title="鶏むね肉の照り焼き"
          variant="large"
          backAction={() => {}}
          scrollY={scrollY}
        />
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardText}>手順 {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: 600,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
});
