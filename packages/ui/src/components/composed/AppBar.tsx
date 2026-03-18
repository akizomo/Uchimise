import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { fontFamily, fontSize, spacing } from '@uchimise/tokens';

import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';

// ── Constants ─────────────────────────────────────────────────────────────────

/** ナビゲーションバー部の高さ — 全バリアント共通（M3: 64dp） */
export const TOP_APP_BAR_HEIGHT = 64;

/** medium の展開エリア高さ（M3: 112 - 64 = 48dp） */
export const TOP_APP_BAR_MEDIUM_EXPANDED = 48;

/** large の展開エリア高さ（60dp — タイトル上余白 ~14px） */
export const TOP_APP_BAR_LARGE_EXPANDED = 60;

/** medium の合計高さ（= 112） */
export const TOP_APP_BAR_MEDIUM_HEIGHT = TOP_APP_BAR_HEIGHT + TOP_APP_BAR_MEDIUM_EXPANDED;

/** large の合計高さ（= 152） */
export const TOP_APP_BAR_LARGE_HEIGHT = TOP_APP_BAR_HEIGHT + TOP_APP_BAR_LARGE_EXPANDED;

// Legacy aliases
/** @deprecated Use TOP_APP_BAR_HEIGHT */
export const APP_BAR_COMPACT_HEIGHT = TOP_APP_BAR_HEIGHT;
/** @deprecated Use TOP_APP_BAR_LARGE_HEIGHT */
export const APP_BAR_LARGE_HEIGHT = TOP_APP_BAR_LARGE_HEIGHT;
/** @deprecated Use TOP_APP_BAR_LARGE_EXPANDED */
export const APP_BAR_LARGE_TITLE_HEIGHT = TOP_APP_BAR_LARGE_EXPANDED;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AppBarAction {
  /** テキストラベル（icon がない場合に表示） */
  label?: string;
  /** アイコンノード */
  icon?: React.ReactNode;
  /** アイコン使用時のアクセシビリティラベル */
  accessibilityLabel?: string;
  onPress: () => void;
}

export interface AppBarProps {
  title: string;
  /**
   * `small`         — 64dp, タイトル左寄せ（M3 Small）
   * `centerAligned` — 64dp, タイトル中央揃え（M3 Center-aligned）
   * `medium`        — 112dp, 展開タイトルがスクロールで collapse（M3 Medium）
   * `large`         — 152dp, 展開タイトルがスクロールで collapse（M3 Large）
   * @default 'small'
   */
  variant?: 'small' | 'centerAligned' | 'medium' | 'large';
  /** 戻るボタン（ChevronLeft を自動で使用） */
  backAction?: () => void;
  /**
   * 右側アクション（最大3つ）。
   * medium/large は最大2つ、centerAligned は最大1つを推奨。
   */
  trailingIcons?: AppBarAction[];
  /**
   * useScrollHeader() から受け取る Animated.Value。
   * medium/large ではタイトル collapse に使用。small/centerAligned では separator のみ。
   */
  scrollY?: Animated.Value;
  /** @deprecated Use trailingIcons */
  rightAction?: AppBarAction;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AppBar({
  title,
  variant = 'small',
  backAction,
  trailingIcons,
  rightAction,
  scrollY,
}: AppBarProps) {
  const theme = useTheme();

  // Legacy rightAction → trailingIcons
  const actions: AppBarAction[] = trailingIcons ?? (rightAction ? [rightAction] : []);

  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const scroll = scrollY ?? fallbackScrollY;

  const staticZero = useRef(new Animated.Value(0)).current;
  const staticOne  = useRef(new Animated.Value(1)).current;

  const isExpandable = variant === 'medium' || variant === 'large';
  const expandedHeight = variant === 'large'
    ? TOP_APP_BAR_LARGE_EXPANDED
    : TOP_APP_BAR_MEDIUM_EXPANDED;

  // ── Separator（スクロール開始で表示） ────────────────────────────────────
  const separatorOpacity = scroll.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // ── 展開エリアの高さ（medium/large のみ collapse） ───────────────────────
  const expandedAreaHeight = isExpandable
    ? scroll.interpolate({
        inputRange:  [0, expandedHeight],
        outputRange: [expandedHeight, 0],
        extrapolate: 'clamp',
      })
    : staticZero;

  // ── 展開タイトルの opacity（scroll で fade out） ──────────────────────────
  const expandedFadeEnd = variant === 'large' ? 60 : 32;
  const expandedTitleOpacity = isExpandable
    ? scroll.interpolate({
        inputRange:  [0, expandedFadeEnd],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : staticZero;

  // ── ナビバータイトルの opacity（medium/large では scroll で fade in） ──────
  const navFadeStart = variant === 'large' ? 36 : 16;
  const navFadeEnd   = variant === 'large' ? 60 : 48;
  const navTitleOpacity = isExpandable
    ? scroll.interpolate({
        inputRange:  [navFadeStart, navFadeEnd],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    : staticOne;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bgNav }]}>

      {/* ── ナビゲーションバー ───────────────────────────────────────────── */}
      <View style={styles.navBar}>

        {/* Leading: 戻るボタン（なければ省略してタイトルを左端から開始） */}
        {backAction && (
          <View style={styles.leading}>
            <IconButton
              icon={<Icon as={ChevronLeft} size="md" color="secondary" />}
              onPress={backAction}
              variant="ghost"
              size="md"
              accessibilityLabel="戻る"
            />
          </View>
        )}

        {/* ナビバータイトル */}
        <Animated.View
          style={[
            styles.navTitleWrap,
            !backAction && styles.navTitleNoLeading,
            actions.length === 0 && styles.navTitleNoTrailing,
            variant === 'centerAligned' && styles.navTitleCenter,
            { opacity: navTitleOpacity },
          ]}
        >
          <Text
            style={[styles.navTitle, { color: theme.label }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </Animated.View>

        {/* Trailing: アクションアイコン（なければ省略） */}
        {actions.length > 0 && (
        <View style={styles.trailing}>
          {actions.map((action, i) =>
            action.icon ? (
              <IconButton
                key={i}
                icon={action.icon}
                onPress={action.onPress}
                variant="ghost"
                size="md"
                accessibilityLabel={action.accessibilityLabel ?? ''}
              />
            ) : (
              <Pressable
                key={i}
                onPress={action.onPress}
                style={styles.trailingLabel}
                hitSlop={8}
              >
                <Text style={[styles.trailingLabelText, { color: theme.labelSecondary }]}>
                  {action.label}
                </Text>
              </Pressable>
            )
          )}
        </View>
        )}
      </View>

      {/* ── 展開タイトルエリア（medium/large のみ） ─────────────────────── */}
      {isExpandable && (
        <Animated.View style={[styles.expandedArea, { height: expandedAreaHeight }]}>
          <Animated.View style={[styles.expandedTitleWrap, { opacity: expandedTitleOpacity }]}>
            <Text
              style={[
                styles.expandedTitle,
                variant === 'large' && styles.expandedTitleLarge,
                { color: theme.label },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* ── セパレーター ─────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.separator,
          { backgroundColor: theme.separator, opacity: separatorOpacity },
        ]}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {},
  navBar: {
    height: TOP_APP_BAR_HEIGHT,     // 64dp (M3)
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  leading: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navTitleWrap: {
    flex: 1,
    paddingLeft: spacing.xs,
    justifyContent: 'center',
  },
  navTitleNoLeading: {
    paddingLeft: spacing.md,   // leading なし → 左端から M3 標準の 16dp
  },
  navTitleNoTrailing: {
    paddingRight: spacing.md,  // trailing なし → 右端まで詰める
  },
  navTitleCenter: {
    alignItems: 'center',
    paddingLeft: 0,
  },
  navTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.h2,           // 22px ≈ M3 Title Large (22sp)
    fontWeight: '600',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  trailingLabel: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  trailingLabelText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  expandedArea: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  expandedTitleWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  expandedTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 24,                    // M3 Headline Small (24sp) — medium variant
    fontWeight: '600',
  },
  expandedTitleLarge: {
    fontSize: 32,                    // M3 Headline Large (32sp) — large variant
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
