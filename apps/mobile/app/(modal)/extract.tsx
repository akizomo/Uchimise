import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Timer } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { amber, spacing, radius, textStyle } from '@uchimise/tokens';
import { ActivityIndicator, AppBar, Button, Icon, PhaseBanner, Tag, TextInput, useTheme } from '@uchimise/ui';

import { useExtract } from '../../src/hooks/useExtract';

const ERROR_MESSAGES: Record<string, string> = {
  private_post:       'この投稿は非公開のようです。URLのみ保存しておきました。',
  quota_exceeded:     'しばらく時間をおいてから試してみてください。',
  extraction_failed:  'うまく保存できませんでした。もう一度試してみてください。',
  manual_required:    '材料の自動取得ができませんでした。手動で追加することもできます。',
};

export default function ExtractScreen() {
  const { url: paramUrl } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { mutate, data, isPending, error } = useExtract();
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    if (paramUrl) mutate(paramUrl);
  }, [paramUrl, mutate]);

  function handleExtract() {
    const target = inputUrl.trim();
    if (!target) return;
    mutate(target);
  }

  function getRecipeId(): string | undefined {
    if (data?.code === 'already_saved') return data.recipeId;
    return data?.data?.id;
  }

  function handleSave() {
    const recipeId = getRecipeId();
    if (!recipeId) return;
    router.replace(`/recipe/${recipeId}`);
  }

  function handleCookNow() {
    const recipeId = getRecipeId();
    if (!recipeId) return;
    router.replace(`/cooking/${recipeId}`);
  }

  const recipe = data?.data;
  const errorCode = data?.error ?? (error ? 'extraction_failed' : null);
  const isAlreadySaved = data?.code === 'already_saved';
  const isManualRequired = data?.code === 'manual_required';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title="レシピを保存"
        variant="centerAligned"
        trailingIcons={[{ label: 'やめる', onPress: () => router.back() }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* URL入力欄（URLなしで開いた場合） */}
        {!paramUrl && !data && !isPending && (
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
                autoCorrect={false}
              />
            </View>
            <Button
              label="読み込む"
              onPress={handleExtract}
              disabled={!inputUrl.trim()}
            />
          </View>
        )}

        {/* ローディング */}
        {isPending && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" />
            <Text style={[styles.loadingText, { color: theme.labelSecondary }]}>
              レシピを読み込んでいます…
            </Text>
          </View>
        )}

        {/* エラー */}
        {!isPending && errorCode && (
          <View style={[styles.alertBox, { backgroundColor: theme.negativeBg, borderColor: theme.negativeBorder }]}>
            <Text style={[textStyle.body, { color: theme.negative }]}>
              {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.extraction_failed}
            </Text>
          </View>
        )}

        {/* already_saved */}
        {isAlreadySaved && (
          <View style={[styles.alertBox, { backgroundColor: theme.positiveBg, borderColor: theme.positiveBorder }]}>
            <Text style={[textStyle.body, { color: theme.positive }]}>
              このレシピはすでに棚に保存されています。
            </Text>
          </View>
        )}

        {/* Phase 1 結果 */}
        {!isPending && recipe && (
          <>
            <PhaseBanner visible={recipe.extraction_status === 'pending'} />

            {recipe.thumbnail_url ? (
              <Image
                source={{ uri: recipe.thumbnail_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Text style={styles.thumbnailEmoji}>🍳</Text>
              </View>
            )}

            <Text style={[textStyle.title, { color: theme.label }]}>{recipe.title}</Text>

            <View style={styles.metaRow}>
              <Tag label={recipe.source_type === 'youtube' ? 'YouTube' : 'Instagram'} variant="source" />
              {recipe.cook_time_minutes && (
                <Tag
                  label={`${recipe.cook_time_minutes}分`}
                  variant="time"
                  icon={<Icon as={Timer} size={12} color="tint" />}
                />
              )}
              {recipe.extraction_status === 'pending' && (
                <Tag label="未確認" variant="unconfirmed" />
              )}
            </View>

            {recipe.ingredients.length > 0 && (
              <View style={[styles.ingredientsCard, { backgroundColor: theme.bgSecondary, borderColor: theme.separator }]}>
                <Text style={[textStyle.labelSm, { color: theme.labelSecondary }]}>材料（確認中）</Text>
                {recipe.ingredients.slice(0, 6).map((ing, idx) => (
                  <Text key={idx} style={[textStyle.body, { color: theme.label }]}>
                    ・{ing.name}
                  </Text>
                ))}
                {recipe.ingredients.length > 6 && (
                  <Text style={[textStyle.bodySm, { color: theme.labelTertiary }]}>
                    他 {recipe.ingredients.length - 6} 品目
                  </Text>
                )}
              </View>
            )}

            {/* manual_required 案内 */}
            {isManualRequired && (
              <View style={[styles.alertBox, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
                <Text style={[textStyle.body, { color: theme.warningText }]}>
                  材料の自動取得ができませんでした。保存後に手動で追加できます。
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* フッターアクション */}
      {!isPending && (data?.success || isAlreadySaved) && (
        <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bgNav }]}>
          {isAlreadySaved ? (
            <Button
              label="保存済みレシピを見る"
              variant="secondary"
              onPress={handleSave}
            />
          ) : (
            <View style={styles.footerButtons}>
              <View style={styles.footerSecondary}>
                <Button
                  label="棚に保存する"
                  variant="secondary"
                  onPress={handleSave}
                />
              </View>
              <View style={styles.footerPrimary}>
                <Button
                  label="今すぐ調理する"
                  onPress={handleCookNow}
                />
              </View>
            </View>
          )}
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
  ingredientsCard: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
    gap: spacing.xs,
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
  footerSecondary: { flex: 1 },
  footerPrimary: { flex: 2 },
});
