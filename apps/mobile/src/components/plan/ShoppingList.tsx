import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { amber, fontFamily, fontSize, radius, spacing } from '@uchimise/tokens';
import { useTheme } from '@uchimise/ui';

import {
  aggregateIngredients,
  type RawIngredient,
} from '../../utils/aggregateIngredients';

interface ShoppingListProps {
  /** All ingredients collected from the week's planned recipes */
  ingredients: RawIngredient[];
}

export function ShoppingList({ ingredients }: ShoppingListProps) {
  const theme = useTheme();
  const items = aggregateIngredients(ingredients);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
          献立にレシピを追加すると、買い出しリストが表示されます。
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.heading, { color: theme.textSecondary }]}>
        買い出しリスト — {items.length}品目
      </Text>

      <View style={[styles.card, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
        {items.map((item, idx) => (
          <View
            key={`${item.name}-${idx}`}
            style={[
              styles.row,
              idx < items.length - 1 && {
                borderBottomWidth: 0.5,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: amber[300] }]} />
              <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
            </View>

            <View style={styles.rowRight}>
              {item.display ? (
                <Text style={[styles.amount, { color: theme.textSecondary }]}>
                  {item.display}
                </Text>
              ) : null}
              {item.recipeCount > 1 && (
                <Text style={[styles.recipeCount, { color: theme.textTertiary }]}>
                  ×{item.recipeCount}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.6,
  },
  heading: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amount: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  recipeCount: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});
