import React, { useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { colors, spacing, radius, textStyle } from '@uchimise/tokens';
import { AppBar, Icon, SegmentedControl, useTheme } from '@uchimise/ui';

import {
  getWeekStart,
  getMealSlotLabel,
  toDateString,
  useMealPlans,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from '../../src/hooks/useMealPlans';
import { ShoppingList } from '../../src/components/plan/ShoppingList';
import { useRemoveFromMeal } from '../../src/hooks/useRemoveFromMeal';

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const SEGMENT_OPTIONS = ['レシピ', '買い出し'];

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: '朝',
  lunch: '昼',
  dinner: '夕',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return toDateString(d);
}

function formatWeekRange(weekStartStr: string): string {
  const start = new Date(weekStartStr + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function getWeekDays(weekStartStr: string): Array<{ dateStr: string; label: string; date: number }> {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartStr + 'T00:00:00');
    d.setDate(d.getDate() + i);
    return {
      label: WEEK_DAYS[d.getDay()],
      dateStr: toDateString(d),
      date: d.getDate(),
    };
  });
}

// ─── WeekNav ─────────────────────────────────────────────────────────────────

interface WeekNavProps {
  weekStartStr: string;
  onPrev: () => void;
  onNext: () => void;
}

function WeekNav({ weekStartStr, onPrev, onNext }: WeekNavProps) {
  const theme = useTheme();
  const thisWeekStart = getWeekStart();
  const isCurrentWeek = weekStartStr === thisWeekStart;

  const label = isCurrentWeek ? '今週' : formatWeekRange(weekStartStr);

  return (
    <View style={[styles.weekNav, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={onPrev}
        style={styles.weekNavArrow}
        accessibilityRole="button"
        accessibilityLabel="前の週"
        hitSlop={8}
      >
        <Icon as={ChevronLeft} size={20} color="secondary" />
      </Pressable>

      <Text style={[styles.weekNavLabel, { color: theme.label }]}>{label}</Text>

      <Pressable
        onPress={onNext}
        style={styles.weekNavArrow}
        accessibilityRole="button"
        accessibilityLabel="次の週"
        hitSlop={8}
      >
        <Icon as={ChevronRight} size={20} color="secondary" />
      </Pressable>
    </View>
  );
}

// ─── MealSlotItem ─────────────────────────────────────────────────────────────

interface MealSlotItemProps {
  plan: MealPlan;
  onRemove: (id: string) => void;
}

function MealSlotItem({ plan, onRemove }: MealSlotItemProps) {
  const theme = useTheme();
  const router = useRouter();
  const recipe = plan.recipes;

  return (
    <Pressable
      style={[styles.slotItem, { borderBottomColor: theme.separator }]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      accessibilityRole="button"
    >
      <View style={[styles.slotBadge, { backgroundColor: theme.bgSecondary }]}>
        <Text style={[styles.slotBadgeText, { color: theme.labelSecondary }]}>
          {SLOT_LABELS[plan.meal_slot]}
        </Text>
      </View>

      {recipe.thumbnail_url ? (
        <Image
          source={{ uri: recipe.thumbnail_url }}
          style={styles.slotThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.slotThumbnail, styles.slotThumbnailPlaceholder]}>
          <Text style={styles.slotThumbnailEmoji}>🍳</Text>
        </View>
      )}

      <Text style={[styles.slotTitle, { color: theme.label }]} numberOfLines={2}>
        {recipe.title}
      </Text>

      <Pressable
        onPress={() => onRemove(plan.id)}
        style={styles.slotRemove}
        accessibilityRole="button"
        accessibilityLabel="献立から外す"
        hitSlop={8}
      >
        <Icon as={X} size={16} color="tertiary" />
      </Pressable>
    </Pressable>
  );
}

// ─── EmptySlot ────────────────────────────────────────────────────────────────

interface EmptySlotProps {
  slot: MealSlot;
}

function EmptySlot({ slot }: EmptySlotProps) {
  const theme = useTheme();
  return (
    <View style={[styles.slotItem, styles.slotItemEmpty, { borderBottomColor: theme.separator }]}>
      <View style={[styles.slotBadge, { backgroundColor: theme.bgSecondary }]}>
        <Text style={[styles.slotBadgeText, { color: theme.labelTertiary }]}>
          {SLOT_LABELS[slot]}
        </Text>
      </View>
      <Text style={[styles.slotEmptyText, { color: theme.labelTertiary }]}>
        —
      </Text>
    </View>
  );
}

// ─── DaySection ───────────────────────────────────────────────────────────────

interface DaySectionProps {
  dateStr: string;
  dayLabel: string;
  date: number;
  plans: MealPlan[];
  onRemove: (id: string) => void;
}

function DaySection({ dateStr, dayLabel, date, plans, onRemove }: DaySectionProps) {
  const theme = useTheme();
  const todayStr = toDateString();
  const isToday = dateStr === todayStr;

  const plansBySlot: Record<MealSlot, MealPlan | undefined> = {
    breakfast: plans.find((p) => p.meal_slot === 'breakfast'),
    lunch: plans.find((p) => p.meal_slot === 'lunch'),
    dinner: plans.find((p) => p.meal_slot === 'dinner'),
  };

  return (
    <View style={[styles.daySection, { borderColor: theme.border }]}>
      {/* Date header */}
      <View
        style={[
          styles.dayHeader,
          isToday
            ? { backgroundColor: colors.espresso }
            : { backgroundColor: theme.bgSecondary },
        ]}
      >
        <Text
          style={[
            styles.dayHeaderText,
            { color: isToday ? colors.cream : theme.labelSecondary },
          ]}
        >
          {dayLabel} {date}日
          {isToday && (
            <Text style={[styles.dayHeaderToday, { color: colors.ochre }]}> 今日</Text>
          )}
        </Text>
      </View>

      {/* Meal slots */}
      {MEAL_SLOTS.map((slot) => {
        const plan = plansBySlot[slot];
        if (plan) {
          return <MealSlotItem key={plan.id} plan={plan} onRemove={onRemove} />;
        }
        return <EmptySlot key={slot} slot={slot} />;
      })}
    </View>
  );
}

// ─── WeekPlanScreen ───────────────────────────────────────────────────────────

export default function WeekPlanScreen() {
  const { weekStart: paramWeekStart } = useLocalSearchParams<{ weekStart: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [displayWeekStart, setDisplayWeekStart] = useState(
    paramWeekStart ?? getWeekStart()
  );
  const [segmentValue, setSegmentValue] = useState(SEGMENT_OPTIONS[0]);

  const {
    data: mealPlans,
    isRefetching,
    refetch,
  } = useMealPlans(displayWeekStart);

  const removeMeal = useRemoveFromMeal();

  const weekDays = getWeekDays(displayWeekStart);

  // Group plans by date
  const plansByDate = (mealPlans ?? []).reduce<Record<string, MealPlan[]>>((acc, plan) => {
    if (!acc[plan.planned_date]) acc[plan.planned_date] = [];
    acc[plan.planned_date].push(plan);
    return acc;
  }, {});

  // All ingredients for shopping list
  const weekIngredients = (mealPlans ?? []).flatMap((p) => p.recipes.ingredients);

  function handlePrevWeek() {
    setDisplayWeekStart((ws) => addWeeks(ws, -1));
  }

  function handleNextWeek() {
    setDisplayWeekStart((ws) => addWeeks(ws, 1));
  }

  function handleRemove(mealPlanId: string) {
    removeMeal.mutate(mealPlanId);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title="献立"
        variant="centerAligned"
        leadingIcon={{ label: '戻る', onPress: () => router.back() }}
      />

      <WeekNav
        weekStartStr={displayWeekStart}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
      />

      <View style={[styles.segmentWrapper, { borderBottomColor: theme.border }]}>
        <SegmentedControl
          options={SEGMENT_OPTIONS}
          value={segmentValue}
          onValueChange={setSegmentValue}
        />
      </View>

      <ScrollView
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
          <View style={styles.daySections}>
            {weekDays.map(({ dateStr, label, date }) => (
              <DaySection
                key={dateStr}
                dateStr={dateStr}
                dayLabel={label}
                date={date}
                plans={plansByDate[dateStr] ?? []}
                onRemove={handleRemove}
              />
            ))}
          </View>
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

  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
  },
  weekNavArrow: {
    padding: spacing.xs,
  },
  weekNavLabel: {
    ...textStyle.labelMd,
  },

  segmentWrapper: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },

  scrollContent: {
    paddingBottom: spacing.xxl * 2,
    flexGrow: 1,
  },

  daySections: {
    gap: spacing.sm,
    padding: spacing.md,
  },

  daySection: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  dayHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dayHeaderText: {
    ...textStyle.labelSm,
  },
  dayHeaderToday: {
    ...textStyle.labelSm,
  },

  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
  },
  slotItemEmpty: {
    opacity: 0.5,
  },
  slotBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  slotBadgeText: {
    ...textStyle.micro,
  },
  slotThumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    flexShrink: 0,
    overflow: 'hidden',
  },
  slotThumbnailPlaceholder: {
    backgroundColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotThumbnailEmoji: {
    fontSize: 20,
  },
  slotTitle: {
    ...textStyle.bodySm,
    flex: 1,
  },
  slotEmptyText: {
    ...textStyle.bodySm,
    flex: 1,
  },
  slotRemove: {
    padding: spacing.xs,
    flexShrink: 0,
  },
});
