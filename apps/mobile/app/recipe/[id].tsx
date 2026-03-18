import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { spacing, radius, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, AppBar, Button, Tag, Toast, useTheme } from '@uchimise/ui';

import { useRecipe } from '../../src/hooks/useRecipe';
import { useAddToMeal } from '../../src/hooks/useAddToMeal';
import {
  getCurrentMealSlot,
  getMealSlotLabel,
  MEAL_SLOTS,
  toDateString,
  type MealSlot,
} from '../../src/hooks/useMealPlans';
import { RecipeDetailSkeleton } from '../../src/components/common';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: recipe, isLoading, isError } = useRecipe(id ?? '');
  const addToMeal = useAddToMeal();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  function handleCook() {
    if (!recipe) return;
    router.push(`/cooking/${recipe.id}`);
  }

  function handleAddToMeal() {
    if (!recipe) return;

    const today = toDateString();
    const currentSlot = getCurrentMealSlot();

    // Build options: current slot first, then the others
    const slots: MealSlot[] = [
      currentSlot,
      ...MEAL_SLOTS.filter((s) => s !== currentSlot),
    ];

    Alert.alert(
      '献立に入れる',
      '今日のどの食事に入れますか。',
      [
        ...slots.map((slot) => ({
          text: getMealSlotLabel(slot),
          onPress: () => {
            addToMeal.mutate(
              { recipeId: recipe.id, plannedDate: today, mealSlot: slot },
              {
                onSuccess: () => {
                  setToastMessage(`「${getMealSlotLabel(slot)}」の献立に加えました。`);
                  setToastVisible(true);
                },
                onError: (err: Error & { status?: number }) => {
                  if (err.message?.includes('409') || (err as { status?: number }).status === 409) {
                    Alert.alert('', 'その食事にはすでにレシピが入っています。');
                  } else {
                    Alert.alert('', 'うまく保存できませんでした。もう一度試してみてください。');
                  }
                },
              }
            );
          },
        })),
        { text: 'やめておく', style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title={recipe?.title ?? ''}
        variant="small"
        backAction={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <RecipeDetailSkeleton />
        ) : isError || !recipe ? (
          <View style={styles.errorContainer}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              うまく読み込めませんでした。もう一度試してみてください。
            </Text>
          </View>
        ) : (
          <>
            {/* Meta */}
            <Text style={[textStyle.bodySm, { color: theme.labelTertiary }]}>
              {recipe.cook_time_minutes != null ? `${recipe.cook_time_minutes}分 · ` : ''}
              {recipe.creator_name ?? ''}
            </Text>

            {/* Thumbnail */}
            {recipe.thumbnail_url && (
              <Image
                source={{ uri: recipe.thumbnail_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            )}

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {recipe.tags.map((tag) => (
                  <Tag key={tag} label={tag} variant="unconfirmed" />
                ))}
              </View>
            )}

            {/* Ingredients */}
            <Text style={[textStyle.titleSm, { color: theme.label }]}>材料</Text>
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              {recipe.ingredients.map((ing, idx) => (
                <View
                  key={`${ing.name}-${idx}`}
                  style={[
                    styles.ingredientRow,
                    idx < recipe.ingredients.length - 1 && {
                      borderBottomWidth: 0.5,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[textStyle.body, { color: theme.label }]}>{ing.name}</Text>
                  <Text style={[textStyle.num, { color: theme.labelSecondary }]}>
                    {ing.amount ?? ''}{ing.unit ?? ''}
                  </Text>
                </View>
              ))}
            </View>

            {/* Steps */}
            <Text style={[textStyle.titleSm, { color: theme.label }]}>手順</Text>
            {recipe.steps.map((step) => (
              <View key={step.order} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: theme.tint }]}>
                  <Text style={styles.stepNumberText}>{step.order}</Text>
                </View>
                <Text style={[textStyle.body, { color: theme.label, flex: 1 }]}>{step.text}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* CTA Footer */}
      {!isLoading && !isError && recipe && (
        <View style={[styles.footer, { backgroundColor: theme.bgNav, borderTopColor: theme.border }]}>
          <View style={styles.footerTop}>
            <View style={styles.footerFull}>
              <Button
                label="献立に入れる"
                variant="secondary"
                onPress={handleAddToMeal}
                disabled={addToMeal.isPending}
                isLoading={addToMeal.isPending}
              />
            </View>
          </View>
          <View style={styles.footerBottom}>
            <View style={styles.footerSecondary}>
              <Button
                label="動画で見る"
                variant="secondary"
                onPress={() => Linking.openURL(recipe.source_url)}
              />
            </View>
            <View style={styles.footerPrimary}>
              <Button
                label="調理する"
                onPress={handleCook}
              />
            </View>
          </View>
        </View>
      )}
      <Toast
        message={toastMessage}
        variant="positive"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  stepNumberText: {
    ...textStyle.micro,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 0.5,
    gap: spacing.xs,
  },
  footerTop: {
    flexDirection: 'row',
  },
  footerBottom: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerFull: { flex: 1 },
  footerSecondary: { flex: 1 },
  footerPrimary: { flex: 2 },
});
