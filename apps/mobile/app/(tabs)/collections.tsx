import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, textStyle } from '@uchimise/tokens';
import {
  ActivityIndicator,
  AppBar,
  BottomSheet,
  Button,
  EmptyState,
  IconButton,
  RecipeCard,
  TextInput,
  useScrollHeader,
  useTheme,
} from '@uchimise/ui';

import { useCollections, useCreateCollection, useDeleteCollection } from '../../src/hooks/useCollections';
import { useRecipes } from '../../src/hooks/useRecipes';
import { CollectionCard } from '../../src/components/plan/CollectionCard';
import { useRouter } from 'expo-router';

export default function CollectionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: collections, isLoading } = useCollections();
  const { data: recipes } = useRecipes();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [name, setName] = useState('');
  const { scrollY, onScroll } = useScrollHeader();

  const handleCreate = () => {
    if (!name.trim()) return;
    createCollection.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          setIsSheetVisible(false);
        },
      },
    );
  };

  const handleOpenDetail = (id: string) => {
    router.push(`/collection/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteCollection.mutate(id);
  };

  const hasRecipes = (recipes?.length ?? 0) > 0;
  const isEmpty = !isLoading && (!collections || collections.length === 0) && !hasRecipes;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar title="コレクション" variant="large" scrollY={scrollY} />

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator />
          </View>
        ) : isEmpty ? (
          <EmptyState
            icon={<Text style={styles.emptyEmoji}>📚</Text>}
            title="まだ棚が空です。"
            description="SNSで見つけたレシピを、ここに並べてみませんか。"
            actionLabel="コレクションを作成する"
            onAction={() => setIsSheetVisible(true)}
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.list}>
            {/* すべての保存済みレシピ */}
            {hasRecipes && (
              <>
                <Text style={[textStyle.titleSm, { color: theme.labelSecondary }]}>
                  すべてのレシピ
                </Text>
                {recipes!.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    title={recipe.title}
                    creatorName={recipe.creator_name ?? ''}
                    cookTimeMinutes={recipe.cook_time_minutes ?? undefined}
                    sourceType={recipe.source_type}
                    isSaved
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                  />
                ))}
                {collections && collections.length > 0 && (
                  <Text style={[textStyle.titleSm, { color: theme.labelSecondary, marginTop: spacing.md }]}>
                    コレクション
                  </Text>
                )}
              </>
            )}
            {collections?.map((collection) => (
              <CollectionCard
                key={collection.id}
                name={collection.name}
                recipeCount={collection.recipe_count}
                onPress={() => handleOpenDetail(collection.id)}
                onDelete={() => handleDelete(collection.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <IconButton
        icon={<Ionicons name="add" size={20} color={colors.ivory} />}
        onPress={() => setIsSheetVisible(true)}
        variant="filled"
        size="lg"
        accessibilityLabel="コレクションを作成"
        style={styles.fab}
      />

      {/* 作成 BottomSheet */}
      <BottomSheet
        visible={isSheetVisible}
        onClose={() => { setIsSheetVisible(false); setName(''); }}
        title="コレクションを作成"
      >
        <View style={styles.sheetContent}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="例：平日の夜ごはん"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            maxLength={40}
          />
          <View style={styles.sheetActions}>
            <Button
              label="そのままにする"
              variant="secondary"
              onPress={() => { setIsSheetVisible(false); setName(''); }}
            />
            <Button
              label="作成する"
              onPress={handleCreate}
              disabled={!name.trim() || createCollection.isPending}
              isLoading={createCollection.isPending}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    flexGrow: 1,
  },
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  list: {
    gap: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});
