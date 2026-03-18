import React from 'react';
import { Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';
import type { Meta, StoryObj } from '@storybook/react';

import {
  AlertTriangle,
  Apple,
  Bookmark,
  BookmarkCheck,
  Camera,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Flame,
  House,
  Info,
  Link,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  Timer,
  Trash2,
  UtensilsCrossed,
  Users,
  X,
} from 'lucide-react-native';

import { spacing, fontSize, fontFamily } from '@uchimise/tokens';

import { Icon, IconColor, ICON_SIZE } from '../../components/primitives/Icon';
import { useTheme } from '../../hooks/useTheme';

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Icon>;

// ── カタログ ──────────────────────────────────────────────────────────────────

const NAV_ICONS = [
  { icon: House,            label: 'ホーム' },
  { icon: Search,           label: '検索' },
  { icon: Bookmark,         label: '棚' },
  { icon: ChefHat,          label: '調理' },
  { icon: Settings,         label: '設定' },
];

const ACTION_ICONS = [
  { icon: Bookmark,         label: 'Bookmark' },
  { icon: BookmarkCheck,    label: 'BookmarkCheck' },
  { icon: Plus,             label: 'Plus' },
  { icon: Pencil,           label: 'Pencil' },
  { icon: Trash2,           label: 'Trash2' },
  { icon: Share2,           label: 'Share2' },
  { icon: X,                label: 'X' },
  { icon: MoreHorizontal,   label: 'MoreHorizontal' },
  { icon: ChevronLeft,      label: 'ChevronLeft' },
  { icon: ChevronRight,     label: 'ChevronRight' },
  { icon: Camera,           label: 'Camera' },
  { icon: Link,             label: 'Link' },
];

const RECIPE_ICONS = [
  { icon: Timer,            label: 'Timer' },
  { icon: Clock,            label: 'Clock' },
  { icon: Flame,            label: 'Flame' },
  { icon: Users,            label: 'Users' },
  { icon: UtensilsCrossed,  label: 'UtensilsCrossed' },
  { icon: ChefHat,          label: 'ChefHat' },
  { icon: Apple,            label: 'Apple' },
];

const STATUS_ICONS = [
  { icon: Info,             label: 'Info',          color: 'accent'   as IconColor },
  { icon: CircleCheck,      label: 'CircleCheck',   color: 'positive' as IconColor },
  { icon: AlertTriangle,    label: 'AlertTriangle', color: 'warning'  as IconColor },
  { icon: CircleAlert,      label: 'CircleAlert',   color: 'negative' as IconColor },
];

function IconGrid({
  title,
  icons,
  color = 'primary',
}: {
  title: string;
  icons: { icon: LucideIcon; label: string; color?: IconColor }[];
  color?: IconColor;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={{
        fontFamily: fontFamily.body,
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: theme.labelTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
      }}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl }}>
        {icons.map(({ icon, label, color: c }) => (
          <View key={label} style={{ alignItems: 'center', gap: spacing.xs, width: 56 }}>
            <Icon as={icon} size="md" color={c ?? color} />
            <Text style={{
              fontFamily: fontFamily.body,
              fontSize: 10,
              color: theme.labelTertiary,
              textAlign: 'center',
            }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const Catalog: Story = {
  render: () => (
    <View>
      <IconGrid title="ナビゲーション" icons={NAV_ICONS} color="primary" />
      <IconGrid title="アクション" icons={ACTION_ICONS} color="secondary" />
      <IconGrid title="レシピ" icons={RECIPE_ICONS} color="tint" />
      <IconGrid title="ステータス" icons={STATUS_ICONS.map(i => ({ ...i, color: i.color }))} />
    </View>
  ),
};

export const Sizes: Story = {
  render: () => {
    const theme = useTheme();
    return (
      <View style={{ gap: spacing.lg }}>
        {(Object.entries(ICON_SIZE) as [string, number][]).map(([key, px]) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.sm, color: theme.labelTertiary, width: 24 }}>
              {key}
            </Text>
            <Icon as={Bookmark} size={key as any} color="primary" />
            <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.sm, color: theme.labelTertiary }}>
              {px}px
            </Text>
          </View>
        ))}
      </View>
    );
  },
};

export const ColorRoles: Story = {
  render: () => {
    const theme = useTheme();
    const roles: { label: string; color: IconColor }[] = [
      { label: 'primary',   color: 'primary'   },
      { label: 'secondary', color: 'secondary' },
      { label: 'tertiary',  color: 'tertiary'  },
      { label: 'tint',      color: 'tint'      },
      { label: 'positive',  color: 'positive'  },
      { label: 'negative',  color: 'negative'  },
      { label: 'warning',   color: 'warning'   },
      { label: 'accent',    color: 'accent'    },
    ];
    return (
      <View style={{ gap: spacing.md }}>
        {roles.map(({ label, color }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Icon as={Bookmark} size="md" color={color} />
            <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.sm, color: theme.labelSecondary }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    );
  },
};
