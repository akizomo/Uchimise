import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Plus, Timer } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { amber, colors, spacing, radius, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, AppBar, Button, Icon, Tag, TextInput, useTheme } from '@uchimise/ui';

import { useExtract } from '../../src/hooks/useExtract';
import { useRecipe, useRetryPhase2 } from '../../src/hooks/useRecipe';
import { useCollections, useCreateCollection } from '../../src/hooks/useCollections';
import { useAddRecipeToCollection } from '../../src/hooks/useAddRecipeToCollection';

const PHASE1_ERROR_MESSAGES: Record<string, string> = {
  private_post:      'この投稿は非公開のようです。URLのみ保存しておきました。',
  quota_exceeded:    'しばらく時間をおいてから試してみてください。',
  extraction_failed: 'うまく保存できませんでした。もう一度試してみてください。',
};

// ─── CollectionPicker ─────────────────────────────────────────────────────────

interface CollectionPickerProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function CollectionPicker({ selectedId, onSelect }: CollectionPickerProps) {
  const theme = useTheme();
  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();

  function handleCreateNew() {
    Alert.prompt(
      '新しい棚',
      '棚の名前を入力してください。',
      [
        { text: 'そのままにする', style: 'cancel' },
        {
          text: '作成する',
          onPress: (name?: string) => {
            const trimmed = name?.trim();
            if (!trimmed) return;
            createCollection.mutate(
              { name: trimmed },
              { onSuccess: (col) => onSelect(col.id) },
            );
          },
        },
      ],
      'plain-text',
      '',
    );
  }

  return (
    <View style={pickerStyles.container}>
      <Text style={[pickerStyles.sectionLabel, { color: theme.labelSecondary }]}>
        棚を選ぶ（任意）
      </Text>
      <View style={pickerStyles.chipRow}>
        {(collections ?? []).map((col) => {
          const isSelected = selectedId === col.id;
          return (
            <Pressable
              key={col.id}
              style={[
                pickerStyles.chip,
                {
                  borderColor: isSelected ? colors.ochre : theme.border,
                  backgroundColor: isSelected ? colors.espresso : theme.bgSecondary,
                },
              ]}
              onPress={() => onSelect(isSelected ? null : col.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  pickerStyles.chipLabel,
                  { color: isSelected ? colors.cream : theme.label },
                ]}
                numberOfLines={1}
              >
                {col.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[pickerStyles.chip, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]}
          onPress={handleCreateNew}
          accessibilityRole="button"
        >
          <Icon as={Plus} size={14} color={colors.walnut} />
          <Text style={[pickerStyles.chipLabel, { color: theme.labelSecondary }]}>
            新しい棚
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container:    { gap: spacing.sm },
  sectionLabel: { ...textStyle.labelSm },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  chipLabel: {
    ...textStyle.bodySm,
    maxWidth: 120,
  },
});

// ─── ExtractScreen ────────────────────────────────────────────────────────────

export default function ExtractScreen() {
  const { url: paramUrl } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const theme = useTheme();

  // Phase 1
  const { mutate, data: extractData, isPending: isPhase1Loading, error: phase1Error } = useExtract();
  const addRecipeToCollection = useAddRecipeToCollection();

  const [inputUrl, setInputUrl] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Derive recipeId from Phase 1 result
  const isManualRequired = extractData?.code === 'manual_required';
  const recipeId: string | undefined =
    extractData?.code === 'already_saved' ? extractData.recipeId : extractData?.data?.id;

  // Phase 2 polling — starts once recipeId exists, stops on done/failed
  const { data: recipe, isLoading: isRecipeLoading } = useRecipe(recipeId ?? '');
  const retryPhase2 = useRetryPhase2();

  const phase2Status = recipe?.extraction_status; // 'pending' | 'done' | 'failed' | undefined

  // already_saved → redirect immediately
  useEffect(() => {
    if (extractData?.code === 'already_saved' && extractData.recipeId) {
      router.replace({
        pathname: `/recipe/${extractData.recipeId}`,
        params: { toast: 'already_saved' },
      });
    }
  }, [extractData, router]);

  // Auto-extract from URL param
  useEffect(() => {
    if (paramUrl) mutate(paramUrl);
  }, [paramUrl, mutate]);

  function handleExtract() {
    const target = inputUrl.trim();
    if (!target) return;
    mutate(target);
  }

  function navigateToRecipe(id: string) {
    router.replace(`/recipe/${id}`);
  }

  function handleSave() {
    if (!recipeId) return;
    if (selectedCollectionId) {
      setIsSaving(true);
      addRecipeToCollection.mutate(
        { collectionId: selectedCollectionId, recipeId },
        {
          onSettled: () => {
            setIsSaving(false);
            navigateToRecipe(recipeId);
          },
        },
      );
    } else {
      navigateToRecipe(recipeId);
    }
  }

  function handleCookNow() {
    if (!recipeId) return;
    router.replace(`/cooking/${recipeId}`);
  }

  function handleRetry() {
    if (!recipeId) return;
    retryPhase2.mutate(recipeId);
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  const phase1ErrorCode = extractData?.error ?? (phase1Error ? 'extraction_failed' : null);

  // Show Phase 2 loading spinner: during initial fetch OR while status is pending
  const showPhase2Spinner =
    !!recipeId && !isManualRequired && (isRecipeLoading || phase2Status === 'pending');

  // Show ingredients + collection picker + footer save/cook buttons
  const showReadyActions = !!recipeId && (isManualRequired || phase2Status === 'done');

  // Show retry UI
  const showRetry = !!recipeId && !isManualRequired && phase2Status === 'failed';

  // Phase 1 result to display thumbnail/title before Phase 2 resolves
  const phase1Recipe = extractData?.data;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title="レシピを保存"
        variant="centerAligned"
        trailingIcons={[{ label: 'やめる', onPress: () => router.back() }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* URL入力欄（URLなしで開いた場合） */}
        {!paramUrl && !extractData && !isPhase1Loading && (
          <View style={styles.inputRow}>
            <View style={styles.inputFlex}>
              <TextInput
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="YouTube / Instagram のURLを貼り付ける"
                autoFocus
                returnKeyType="go"
                onSubmitEditing={handleExtract}
                autoCapitalize="none"
              />
            </View>
            <Button
              label="読み込む"
              onPress={handleExtract}
              disabled={!inputUrl.trim()}
            />
          </View>
        )}

        {/* Phase 1: ローディング */}
        {isPhase1Loading && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" />
            <Text style={[styles.loadingText, { color: theme.labelSecondary }]}>
              レシピを読み込んでいます…
            </Text>
          </View>
        )}

        {/* Phase 1: エラー */}
        {!isPhase1Loading && phase1ErrorCode && (
          <View style={[styles.alertBox, { backgroundColor: theme.negativeBg, borderColor: theme.negativeBorder }]}>
            <Text style={[textStyle.body, { color: theme.negative }]}>
              {PHASE1_ERROR_MESSAGES[phase1ErrorCode] ?? PHASE1_ERROR_MESSAGES.extraction_failed}
            </Text>
          </View>
        )}

        {/* レシピカード（Phase 1 で取得できたタイトル・サムネイルを先に表示） */}
        {!isPhase1Loading && phase1Recipe && (
          <>
            {phase1Recipe.thumbnail_url ? (
              <Image
                source={{ uri: phase1Recipe.thumbnail_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Text style={styles.thumbnailEmoji}>🍳</Text>
              </View>
            )}

            <Text style={[textStyle.title, { color: theme.label }]}>{phase1Recipe.title}</Text>

            <View style={styles.metaRow}>
              <Tag label={phase1Recipe.source_type === 'youtube' ? 'YouTube' : 'Instagram'} variant="source" />
              {phase1Recipe.cook_time_minutes && (
                <Tag
                  label={`${phase1Recipe.cook_time_minutes}分`}
                  variant="time"
                  icon={<Icon as={Timer} size={12} color="tint" />}
                />
              )}
            </View>

            {/* Phase 2: 処理中スピナー */}
            {showPhase2Spinner && (
              <View style={styles.phase2Spinner}>
                <ActivityIndicator size="small" />
                <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
                  材料と手順を整理しています…
                </Text>
              </View>
            )}

            {/* Phase 2: 失敗 */}
            {showRetry && (
              <View style={[styles.alertBox, { backgroundColor: theme.negativeBg, borderColor: theme.negativeBorder }]}>
                <Text style={[textStyle.body, { color: theme.negative }]}>
                  材料と手順の整理に失敗しました。もう一度試してみてください。
                </Text>
              </View>
            )}

            {/* Phase 2: 完了 — 材料 */}
            {showReadyActions && recipe && !isManualRequired && (
              <View style={[styles.section, { backgroundColor: theme.bgSecondary, borderColor: theme.separator }]}>
                <Text style={[textStyle.labelSm, styles.sectionLabel, { color: theme.labelSecondary }]}>材料</Text>
                {recipe.ingredients.length === 0 ? (
                  <Text style={[textStyle.bodySm, styles.emptyHint, { color: theme.labelTertiary }]}>
                    材料情報が取得できませんでした。保存後に手動で追加することもできます。
                  </Text>
                ) : (
                  recipe.ingredients.map((ing, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.ingredientRow,
                        idx < recipe.ingredients.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.separator },
                      ]}
                    >
                      <Text style={[textStyle.body, { color: theme.label, flex: 1 }]}>
                        {ing.name}
                      </Text>
                      {(ing.amount || ing.unit) && (
                        <Text style={[textStyle.bodySm, { color: theme.labelSecondary }]}>
                          {ing.amount ?? ''}{ing.unit ?? ''}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Phase 2: 完了 — 手順 */}
            {showReadyActions && recipe && !isManualRequired && (
              <View style={[styles.section, { backgroundColor: theme.bgSecondary, borderColor: theme.separator }]}>
                <Text style={[textStyle.labelSm, styles.sectionLabel, { color: theme.labelSecondary }]}>手順</Text>
                {recipe.steps.length === 0 ? (
                  <Text style={[textStyle.bodySm, styles.emptyHint, { color: theme.labelTertiary }]}>
                    手順情報が取得できませんでした。保存後に手動で追加することもできます。
                  </Text>
                ) : (
                  recipe.steps.map((step, idx) => (
                    <View
                      key={step.order}
                      style={[
                        styles.stepRow,
                        idx < recipe.steps.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.separator },
                      ]}
                    >
                      <View style={[styles.stepBadge, { backgroundColor: colors.espresso }]}>
                        <Text style={[textStyle.micro, { color: colors.cream, fontWeight: '600' }]}>
                          {step.order}
                        </Text>
                      </View>
                      <Text style={[textStyle.body, { color: theme.label, flex: 1 }]}>
                        {step.text}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* manual_required 案内 */}
            {isManualRequired && (
              <View style={[styles.alertBox, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
                <Text style={[textStyle.body, { color: theme.warningText }]}>
                  テキスト情報が取得できませんでした。保存後に手動で追加することもできます。
                </Text>
              </View>
            )}

            {/* コレクション選択（Phase 2 完了 or manual_required のとき表示） */}
            {showReadyActions && (
              <CollectionPicker
                selectedId={selectedCollectionId}
                onSelect={setSelectedCollectionId}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* フッター: Phase 2 完了 or manual_required → 棚に保存 + 調理する */}
      {showReadyActions && (
        <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bgNav }]}>
          <View style={styles.footerButtons}>
            <View style={styles.footerSave}>
              <Button
                label="棚に保存する"
                onPress={handleSave}
                isLoading={isSaving}
                disabled={isSaving}
              />
            </View>
            <View style={styles.footerCook}>
              <Button
                label="調理する"
                variant="secondary"
                onPress={handleCookNow}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      )}

      {/* フッター: Phase 2 失敗 → もう一度試す + このまま保存する */}
      {showRetry && (
        <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bgNav }]}>
          <View style={styles.footerButtons}>
            <View style={styles.footerSave}>
              <Button
                label="もう一度試す"
                onPress={handleRetry}
                isLoading={retryPhase2.isPending}
                disabled={retryPhase2.isPending}
              />
            </View>
            <View style={styles.footerCook}>
              <Button
                label="このまま保存"
                variant="secondary"
                onPress={handleSave}
                disabled={retryPhase2.isPending || isSaving}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingState: {
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: { ...textStyle.body },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  inputFlex: { flex: 1 },
  alertBox: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    backgroundColor: amber[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: { fontSize: 48 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  phase2Spinner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  section: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  sectionLabel: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    minHeight: 40,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  emptyHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 0.5,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerSave: { flex: 2 },
  footerCook: { flex: 1 },
});
