import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { spacing, textStyle } from '@uchimise/tokens';
import {
  AlertDialog,
  AppBar,
  Button,
  EmptyState,
  ProgressBar,
  SkeletonLoader,
  Toast,
  useTheme,
} from '@uchimise/ui';

import { useRecipe } from '../../src/hooks/useRecipe';
import { useCreateCookingRecord } from '../../src/hooks/useCreateCookingRecord';

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: recipe, isLoading } = useRecipe(id ?? '');
  const createCookingRecord = useCreateCookingRecord();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'positive' | 'negative'>('positive');

  const steps = recipe?.steps ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = totalSteps > 0 ? (currentStepIndex + 1) / totalSteps : 0;

  function handleNext() {
    if (isLastStep) {
      createCookingRecord.mutate(
        { recipeId: id ?? '' },
        {
          onSuccess: () => setIsCompleted(true),
          onError: () => {
            setToastMessage('うまく記録できませんでした。記録は後から確認できます。');
            setToastVariant('negative');
            setToastVisible(true);
            setIsCompleted(true);
          },
        }
      );
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }

  function handleExitConfirm() {
    setExitDialogVisible(false);
    router.back();
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <View style={styles.completedContainer}>
          <Text style={[textStyle.title, { color: theme.label, textAlign: 'center' }]}>
            できあがりました。
          </Text>
          <Text style={[textStyle.body, { color: theme.labelSecondary, textAlign: 'center' }]}>
            お疲れさまでした。
          </Text>
          <View style={styles.completedAction}>
            <Button
              label="閉じる"
              onPress={() => router.replace('/(tabs)/me')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title={totalSteps > 0 ? `手順 ${currentStepIndex + 1} / ${totalSteps}` : ''}
        variant="centerAligned"
        trailingIcons={[{ label: '終わる', onPress: () => setExitDialogVisible(true) }]}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={24} width="80%" />
          <SkeletonLoader height={20} width="60%" style={{ marginTop: spacing.md }} />
          <SkeletonLoader height={20} width="70%" style={{ marginTop: spacing.sm }} />
        </View>
      ) : totalSteps === 0 ? (
        <EmptyState
          title="手順が見つかりませんでした。"
          style={styles.emptyState}
        />
      ) : (
        <>
          <View style={styles.progressContainer}>
            <ProgressBar value={progress} />
          </View>

          <ScrollView contentContainerStyle={styles.stepContent}>
            <Text style={[textStyle.title, { color: theme.label }]}>
              {steps[currentStepIndex]?.text}
            </Text>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.bgNav, borderTopColor: theme.border }]}>
            <View style={styles.footerButtons}>
              <View style={styles.prevButton}>
                <Button
                  label="← 前の手順"
                  variant="secondary"
                  onPress={handlePrev}
                  disabled={currentStepIndex === 0}
                />
              </View>
              <View style={styles.nextButton}>
                <Button
                  label={isLastStep ? '記録する' : '次の手順 →'}
                  onPress={handleNext}
                  disabled={createCookingRecord.isPending}
                  isLoading={createCookingRecord.isPending}
                />
              </View>
            </View>
          </View>
        </>
      )}

      <AlertDialog
        visible={exitDialogVisible}
        title="調理を終わりますか。"
        description="記録はまだ保存されていません。"
        confirmLabel="終わる"
        cancelLabel="そのままにする"
        onConfirm={handleExitConfirm}
        onCancel={() => setExitDialogVisible(false)}
      />

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    padding: spacing.xl,
  },
  emptyState: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  stepContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 0.5,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prevButton: { flex: 1 },
  nextButton: { flex: 2 },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  completedAction: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
