import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing, textStyle } from '@uchimise/tokens';
import {
  AppBar,
  CollectionCard,
  SegmentedControl,
  useScrollHeader,
  useTheme,
} from '@uchimise/ui';

import { useRouter } from 'expo-router';

import {
  getWeekStart,
  toDateString,
  useMealPlans,
} from '../../src/hooks/useMealPlans';
import { useCollections } from '../../src/hooks/useCollections';
import { useRecipes } from '../../src/hooks/useRecipes';
import { ShoppingList } from '../../src/components/plan/ShoppingList';
import { useRealtimePhase2WithInvalidation } from '../../src/hooks/useRealtimePhase2';
import { useAuth } from '../../src/hooks/useAuth';
import { PlanSkeleton } from '../../src/components/common';

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const SEGMENT_OPTIONS = ['レシピ', '買い出し'];

// ─── WeekCalendar ─────────────────────────────────────────────────────────────

interface WeekCalendarProps {
  onSelectDate: (weekStart: string) => void;
  planDates?: Set<string>;
}

function WeekCalendar({ onSelectDate, planDates }: WeekCalendarProps) {
  const theme = useTheme();
  const today = new Date();
  const todayStr = toDateString(today);
  const dayOfWeek = today.getDay();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    return {
      label: WEEK_DAYS[i],
      dateStr: toDateString(d),
      date: d.getDate(),
    };
  });

  // 今週の weekStart
  const thisWeekStart = getWeekStart();

  return (
    <Pressable
      style={[styles.weekCalendar, { borderBottomColor: theme.border }]}
      onPress={() => onSelectDate(thisWeekStart)}
      accessibilityRole="button"
      accessibilityLabel="今週の献立を見る"
    >
      {days.map((day) => {
        const isToday = day.dateStr === todayStr;
        const hasPlan = planDates?.has(day.dateStr) ?? false;
        return (
          <View key={day.dateStr} style={styles.dayCell}>
            <Text style={[styles.dayLabel, { color: theme.labelTertiary }]}>{day.label}</Text>
            <View
              style={[
                styles.dateCircle,
                isToday && { backgroundColor: colors.espresso },
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: isToday ? colors.cream : theme.labelSecondary },
                ]}
              >
                {day.date}
              </Text>
            </View>
            {hasPlan
              ? <View style={styles.mealDot} />
              : <View style={styles.mealDotPlaceholder} />}
          </View>
        );
      })}
    </Pressable>
  );
}

// ─── CollectionsList ──────────────────────────────────────────────────────────

interface CollectionsListProps {
  onPressCollection: (id: string) => void;
}

function CollectionsList({ onPressCollection }: CollectionsListProps) {
  const theme = useTheme();
  const router = useRouter();
  const { data: collections } = useCollections();
  const { data: recipes } = useRecipes();

  const hasRecipes = (recipes?.length ?? 0) > 0;
  const hasCollections = (collections?.length ?? 0) > 0;

  if (!hasRecipes && !hasCollections) return null;

  const allThumbnails = recipes
    ? recipes.slice(0, 4).map((r) => r.thumbnail_url).filter((u): u is string => Boolean(u))
    : [];

  return (
    <View style={styles.collectionsSection}>
      <Text style={[styles.sectionTitle, { color: theme.label }]}>棚</Text>

      {hasRecipes && (
        <CollectionCard
          name="すべてのレシピ"
          recipeCount={recipes!.length}
          thumbnailUrls={allThumbnails}
          onPress={() => router.push('/(tabs)/collections')}
        />
      )}

      {collections?.map((col) => (
        <CollectionCard
          key={col.id}
          name={col.name}
          recipeCount={col.recipe_count}
          isAuto={col.is_auto}
          thumbnailUrls={col.preview_thumbnails}
          onPress={() => onPressCollection(col.id)}
        />
      ))}
    </View>
  );
}

// ─── PlanScreen ───────────────────────────────────────────────────────────────

export default function PlanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { scrollY, onScroll } = useScrollHeader();
  const [segmentValue, setSegmentValue] = useState(SEGMENT_OPTIONS[0]);

  const { session } = useAuth();
  const weekStart = getWeekStart();
  const {
    data: mealPlans,
    isLoading,
    isRefetching,
    refetch,
  } = useMealPlans(weekStart);

  useRealtimePhase2WithInvalidation(session?.user.id ?? null);

  // カレンダーのドット表示用
  const planDates = new Set((mealPlans ?? []).map((p) => p.planned_date));

  // 今週の全食材（買い出しリスト用）
  const weekIngredients = (mealPlans ?? []).flatMap((p) => p.recipes.ingredients);

  function handleSelectWeek(ws: string) {
    router.push(`/plan/${ws}`);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="献立" variant="large" scrollY={scrollY} />

      {/* WeekCalendar — タップで週間献立へ遷移 */}
      <WeekCalendar
        onSelectDate={handleSelectWeek}
        planDates={planDates}
      />

      {/* セグメント */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          options={SEGMENT_OPTIONS}
          value={segmentValue}
          onValueChange={setSegmentValue}
        />
      </View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.ochre}
          />
        }
      >
        {segmentValue === SEGMENT_OPTIONS[0] ? (
          isLoading ? (
            <PlanSkeleton />
          ) : (
            <CollectionsList
              onPressCollection={(id) => router.push(`/collection/${id}`)}
            />
          )
        ) : (
          <ShoppingList ingredients={weekIngredients} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  weekCalendar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  dayCell: { flex: 1, alignItems: 'center', gap: 4 },
  dayLabel: { ...textStyle.micro },
  dateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { ...textStyle.numSm },
  mealDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ochre,
  },
  mealDotPlaceholder: { width: 4, height: 4 },
  segmentWrapper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    flexGrow: 1,
  },
  collectionsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...textStyle.titleSm,
    paddingHorizontal: spacing.xs,
  },
});
