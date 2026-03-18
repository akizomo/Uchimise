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

import { radius, spacing, textStyle } from '@uchimise/tokens';
import {
  AppBar,
  PhaseBanner,
  RecipeCard,
  SegmentedControl,
  useScrollHeader,
  useTheme,
} from '@uchimise/ui';

import { useRouter } from 'expo-router';

import {
  getCurrentMealSlot,
  getMealSlotLabel,
  getWeekStart,
  MEAL_SLOTS,
  toDateString,
  useMealPlans,
  type MealPlan,
  type MealSlot,
} from '../../src/hooks/useMealPlans';
import { useRemoveFromMeal } from '../../src/hooks/useRemoveFromMeal';
import { useCollections } from '../../src/hooks/useCollections';
import { useFeed } from '../../src/hooks/useFeed';
import { ShoppingList } from '../../src/components/plan/ShoppingList';
import { useRealtimePhase2WithInvalidation } from '../../src/hooks/useRealtimePhase2';
import { useAuth } from '../../src/hooks/useAuth';
import { PlanSkeleton } from '../../src/components/common';

// ---

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const SEGMENT_OPTIONS = ['レシピ', '買い出し'];

// --- WeekCalendar ---

interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
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

  return (
    <View style={[styles.weekCalendar, { borderBottomColor: theme.border }]}>
      {days.map((day) => {
        const isSelected = day.dateStr === selectedDate;
        const isToday = day.dateStr === todayStr;
        return (
          <Pressable
            key={day.dateStr}
            style={styles.dayCell}
            onPress={() => onSelectDate(day.dateStr)}
          >
            <Text style={[styles.dayLabel, { color: theme.labelTertiary }]}>{day.label}</Text>
            <View
              style={[
                styles.dateCircle,
                isSelected && { backgroundColor: theme.tint },
                !isSelected && isToday && { borderWidth: 1, borderColor: theme.tint },
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isSelected
                    ? { color: '#FFFFFF' }
                    : isToday
                    ? { color: theme.tint }
                    : { color: theme.labelSecondary },
                ]}
              >
                {day.date}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- SlotRow ---

interface SlotRowProps {
  slot: MealSlot;
  plan: MealPlan | undefined;
  isCurrent: boolean;
  onPressRecipe: (recipeId: string) => void;
  onRemove: (mealPlanId: string) => void;
}

function SlotRow({ slot, plan, isCurrent, onPressRecipe, onRemove }: SlotRowProps) {
  const theme = useTheme();
  const label = getMealSlotLabel(slot);

  return (
    <View style={styles.slotContainer}>
      <View style={styles.slotHeader}>
        <Text
          style={[
            styles.slotLabel,
            { color: isCurrent ? theme.tint : theme.labelSecondary },
          ]}
        >
          {label}
          {isCurrent ? '（今）' : ''}
        </Text>
      </View>

      {plan ? (
        <RecipeCard
          title={plan.recipes.title}
          creatorName={plan.recipes.creator_name ?? ''}
          cookTimeMinutes={plan.recipes.cook_time_minutes ?? undefined}
          sourceType={plan.recipes.source_type}
          isSaved
          onPress={() => onPressRecipe(plan.recipes.id)}
          onSavePress={() => onRemove(plan.id)}
        />
      ) : (
        <View style={[styles.slotEmpty, { borderColor: theme.border }]}>
          <Text style={[textStyle.bodySm, { color: theme.labelTertiary }]}>
            まだ決まっていません
          </Text>
        </View>
      )}
    </View>
  );
}

// --- CollectionsStrip ---

interface CollectionsStripProps {
  onPressAll: () => void;
  onPressCollection: (id: string) => void;
}

function CollectionsStrip({ onPressAll, onPressCollection }: CollectionsStripProps) {
  const theme = useTheme();
  const { data: collections } = useCollections();

  if (!collections || collections.length === 0) return null;

  return (
    <View style={styles.stripSection}>
      <View style={styles.stripHeader}>
        <Text style={[styles.stripTitle, { color: theme.label }]}>棚</Text>
        <Pressable onPress={onPressAll}>
          <Text style={[styles.stripSeeAll, { color: theme.tint }]}>すべて見る</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripScroll}
      >
        {collections.map((col) => (
          <Pressable
            key={col.id}
            style={[styles.collectionChip, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
            onPress={() => onPressCollection(col.id)}
          >
            <Text style={[styles.chipName, { color: theme.label }]} numberOfLines={1}>
              {col.name}
            </Text>
            <Text style={[styles.chipCount, { color: theme.labelTertiary }]}>
              {col.recipe_count}品
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// --- DiscoverStrip ---

const DISCOVER_PREVIEW_COUNT = 5;

interface DiscoverStripProps {
  onSaveItem: (sourceUrl: string) => void;
  onPressAll: () => void;
}

function DiscoverStrip({ onSaveItem, onPressAll }: DiscoverStripProps) {
  const theme = useTheme();
  const { data } = useFeed();

  const items = (data?.pages[0]?.data ?? []).slice(0, DISCOVER_PREVIEW_COUNT);
  if (items.length === 0) return null;

  return (
    <View style={styles.stripSection}>
      <View style={styles.stripHeader}>
        <Text style={[styles.stripTitle, { color: theme.label }]}>今日の発見</Text>
        <Pressable onPress={onPressAll}>
          <Text style={[styles.stripSeeAll, { color: theme.tint }]}>もっと見る</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripScroll}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.discoverCardWrapper}>
            <RecipeCard
              title={item.title}
              creatorName={item.creatorName}
              sourceType={item.sourceType}
              isSaved={false}
              onSavePress={() => onSaveItem(item.sourceUrl)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// --- Helpers ---

function getEmptyStateMessage(): string {
  const hour = new Date().getHours();
  if (hour < 10) return '今日の朝ごはん、いかがですか。';
  if (hour < 14) return '昼ごはんの支度、はじめませんか。';
  if (hour < 21) return '今夜の一品、考えてみませんか。';
  return '明日の夕食、決めておきませんか。';
}

// --- PlanScreen ---

export default function PlanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [segmentValue, setSegmentValue] = useState(SEGMENT_OPTIONS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(toDateString());
  const { scrollY, onScroll } = useScrollHeader();

  const { session } = useAuth();
  const weekStart = getWeekStart();
  const {
    data: mealPlans,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useMealPlans(weekStart);

  const removeFromMeal = useRemoveFromMeal();

  useRealtimePhase2WithInvalidation(session?.user.id ?? null);

  // Plans for the selected date
  const plansForDate = (mealPlans ?? []).filter((p) => p.planned_date === selectedDate);

  // Map slot → plan
  const planBySlot: Partial<Record<MealSlot, MealPlan>> = {};
  for (const p of plansForDate) {
    planBySlot[p.meal_slot] = p;
  }

  const hasAnyPlan = plansForDate.length > 0;
  const todayStr = toDateString();
  const isToday = selectedDate === todayStr;
  const currentSlot = getCurrentMealSlot();

  // Whether any recipe has pending extraction
  const hasUnconfirmed =
    (mealPlans ?? []).some((p) => p.recipes.extraction_status !== 'done') ?? false;

  // All ingredients from this week's meal plans (for ShoppingList)
  const weekIngredients = (mealPlans ?? []).flatMap((p) => p.recipes.ingredients);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="献立" variant="large" scrollY={scrollY} />

      <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.tint}
          />
        }
      >
        {segmentValue === SEGMENT_OPTIONS[0] ? (
          <>
            <PhaseBanner visible={hasUnconfirmed} />

            {isLoading ? (
              <PlanSkeleton />
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.labelTertiary }]}>
                  うまく読み込めませんでした。画面を引っ張って更新してください。
                </Text>
              </View>
            ) : hasAnyPlan ? (
              MEAL_SLOTS.map((slot) => (
                <SlotRow
                  key={slot}
                  slot={slot}
                  plan={planBySlot[slot]}
                  isCurrent={isToday && slot === currentSlot}
                  onPressRecipe={(recipeId) => router.push(`/recipe/${recipeId}`)}
                  onRemove={(mealPlanId) => removeFromMeal.mutate(mealPlanId)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.labelTertiary }]}>
                  {isToday
                    ? getEmptyStateMessage()
                    : 'この日の献立はまだ決まっていません。'}
                </Text>
                <Text style={[styles.emptyHint, { color: theme.labelTertiary }]}>
                  レシピ詳細から「献立に入れる」で追加できます。
                </Text>
              </View>
            )}

            {/* 棚セクション */}
            <CollectionsStrip
              onPressAll={() => router.push('/collections')}
              onPressCollection={(id) => router.push(`/collection/${id}`)}
            />

            {/* 今日の発見セクション */}
            <DiscoverStrip
              onSaveItem={(url) =>
                router.push({ pathname: '/(modal)/extract', params: { url } })
              }
              onPressAll={() => router.push('/discover')}
            />
          </>
        ) : (
          <ShoppingList ingredients={weekIngredients} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  segmentWrapper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  slotContainer: {
    gap: spacing.xs,
  },
  slotHeader: {
    paddingHorizontal: spacing.xs,
  },
  slotLabel: {
    ...textStyle.titleSm,
  },
  slotEmpty: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  errorContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  errorText: {
    ...textStyle.body,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...textStyle.body,
    textAlign: 'center',
  },
  emptyHint: {
    ...textStyle.bodySm,
    textAlign: 'center',
  },
  // CollectionsStrip
  stripSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  stripTitle: {
    ...textStyle.titleSm,
  },
  stripSeeAll: {
    ...textStyle.bodySm,
  },
  stripScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  collectionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0.5,
    gap: 2,
    minWidth: 96,
    maxWidth: 160,
  },
  chipName: {
    ...textStyle.bodySm,
    fontWeight: '500',
  },
  chipCount: {
    ...textStyle.micro,
  },
  discoverCardWrapper: {
    width: 240,
  },
});
