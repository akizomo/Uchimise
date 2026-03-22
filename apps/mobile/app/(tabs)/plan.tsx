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
  planDates?: Set<string>;
}

function WeekCalendar({ selectedDate, onSelectDate, planDates }: WeekCalendarProps) {
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
        const isToday = day.dateStr === todayStr;
        const isSelected = day.dateStr === selectedDate;
        const hasPlan = planDates?.has(day.dateStr) ?? false;
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
                isToday && { backgroundColor: colors.espresso },
                !isToday && isSelected && { borderWidth: 1, borderColor: colors.ochre },
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isToday
                    ? { color: colors.cream }
                    : isSelected
                    ? { color: colors.ochre }
                    : { color: theme.labelSecondary },
                ]}
              >
                {day.date}
              </Text>
            </View>
            {hasPlan ? <View style={styles.mealDot} /> : <View style={styles.mealDotPlaceholder} />}
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

// --- CollectionsList ---

interface CollectionsListProps {
  onPressCollection: (id: string) => void;
}

function CollectionsList({ onPressCollection }: CollectionsListProps) {
  const theme = useTheme();
  const { data: collections } = useCollections();

  if (!collections || collections.length === 0) return null;

  return (
    <View style={styles.collectionsSection}>
      <Text style={[styles.sectionTitle, { color: theme.label }]}>棚</Text>
      {collections.map((col) => (
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

  const planDates = new Set((mealPlans ?? []).map((p) => p.planned_date));

  // Whether any recipe has pending extraction
  const hasUnconfirmed =
    (mealPlans ?? []).some((p) => p.recipes.extraction_status !== 'done') ?? false;

  // All ingredients from this week's meal plans (for ShoppingList)
  const weekIngredients = (mealPlans ?? []).flatMap((p) => p.recipes.ingredients);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="献立" variant="large" scrollY={scrollY} />

      <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} planDates={planDates} />

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
            <CollectionsList
              onPressCollection={(id) => router.push(`/collection/${id}`)}
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
  mealDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ochre,
  },
  mealDotPlaceholder: {
    width: 4,
    height: 4,
  },
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
  collectionsSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...textStyle.titleSm,
    paddingHorizontal: spacing.xs,
  },
});
