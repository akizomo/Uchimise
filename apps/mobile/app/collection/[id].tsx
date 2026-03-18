import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { spacing, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, AppBar, Icon, IconButton, RecipeCard, useTheme } from '@uchimise/ui';

import { useCollection } from '../../src/hooks/useCollections';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: collection, isLoading, isError } = useCollection(id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title={collection?.name ?? ''}
        variant="small"
        backAction={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" />
          </View>
        ) : isError ? (
          <View style={styles.centerState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              うまく読み込めませんでした。時間をおいてからもう一度お試しください。
            </Text>
          </View>
        ) : !collection || collection.recipes.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={[textStyle.body, { color: theme.labelTertiary, textAlign: 'center' }]}>
              このコレクション、まだ空です。{'\n'}SNSで見つけたレシピを、ここに加えてみませんか。
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {collection.recipes.map((recipe) => (
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
          </View>
        )}
      </ScrollView>

      {/* FAB: SNS URLから新規レシピを保存 */}
      <IconButton
        icon={<Icon as={Plus} size="md" color="#FFFFFF" />}
        onPress={() => router.push('/(modal)/extract')}
        variant="filled"
        size="lg"
        accessibilityLabel="レシピを追加"
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  loadingState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  list: {
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

