import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import YoutubeIframe, { type YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RotateCcw, Timer } from 'lucide-react-native';

import { colors, radius, spacing, textStyle } from '@uchimise/tokens';
import {
  AlertDialog,
  AppBar,
  Button,
  EmptyState,
  Icon,
  ProgressBar,
  SkeletonLoader,
  Toast,
  useTheme,
} from '@uchimise/ui';

import { useRecipe } from '../../src/hooks/useRecipe';
import { useCreateCookingRecord } from '../../src/hooks/useCreateCookingRecord';

// ─── Timer detection ─────────────────────────────────────────────────────────

/**
 * step.timer_seconds があればそれを使う。
 * なければテキストから正規表現でフォールバック検出する。
 * 「○分」「○時間」「○秒」の組み合わせに対応。
 */
function detectTimerSeconds(text: string, timerSeconds?: number | null): number | null {
  if (timerSeconds != null && timerSeconds > 0) return timerSeconds;

  // フォールバック: テキストパース
  // "10分", "1時間30分", "30秒" など
  let total = 0;
  const hourMatch = text.match(/(\d+)\s*時間/);
  const minMatch = text.match(/(\d+)\s*分/);
  const secMatch = text.match(/(\d+)\s*秒/);

  if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);

  // 時間情報がなければ null、あれば秒数
  return total > 0 ? total : null;
}

const PLAYER_HEIGHT = 210; // 16:9 に近い高さ（一般的なスマートフォン幅 ~375px で約 210px）

/** YouTube URL から videoId を抽出する */
function extractVideoId(url: string): string | null {
  return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── TimerBlock ───────────────────────────────────────────────────────────────

type TimerState = 'idle' | 'running' | 'paused' | 'done';

interface TimerBlockProps {
  totalSeconds: number;
  /** ステップが変わるたびに key を変えてリセットする */
  onDone: () => void;
}

function TimerBlock({ totalSeconds, onDone }: TimerBlockProps) {
  const theme = useTheme();
  const [state, setState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setState('running');
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setState('done');
          Vibration.vibrate([0, 400, 200, 400]);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remaining, clearTimer, onDone]);

  const pause = useCallback(() => {
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState('idle');
    setRemaining(totalSeconds);
  }, [clearTimer, totalSeconds]);

  // クリーンアップ
  useEffect(() => () => clearTimer(), [clearTimer]);

  const progress = 1 - remaining / totalSeconds;

  const bgColor =
    state === 'done'
      ? theme.positiveBg ?? colors.honey
      : state === 'running'
      ? theme.bgSecondary
      : theme.bgSecondary;

  const timeColor =
    state === 'done'
      ? colors.ochre
      : state === 'running'
      ? theme.label
      : theme.label;

  return (
    <View style={[timerStyles.container, { backgroundColor: bgColor, borderColor: theme.border }]}>
      {/* ヘッダー */}
      <View style={timerStyles.header}>
        <Icon as={Timer} size={14} color={colors.ochre} />
        <Text style={[timerStyles.headerLabel, { color: theme.labelSecondary }]}>タイマー</Text>
      </View>

      {/* 時間表示 */}
      <Text style={[timerStyles.time, { color: timeColor }]}>
        {formatTime(remaining)}
      </Text>

      {/* プログレスバー */}
      {state !== 'idle' && (
        <View style={timerStyles.progressRow}>
          <View style={[timerStyles.progressTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                timerStyles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: state === 'done' ? colors.ochre : colors.espresso,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* 完了メッセージ */}
      {state === 'done' && (
        <Text style={[timerStyles.doneLabel, { color: colors.ochre }]}>
          時間になりました。
        </Text>
      )}

      {/* ボタン行 */}
      <View style={timerStyles.buttonRow}>
        {(state === 'idle' || state === 'paused') && (
          <Pressable
            style={[timerStyles.primaryBtn, { backgroundColor: colors.espresso }]}
            onPress={start}
            accessibilityRole="button"
            accessibilityLabel={state === 'paused' ? '再開する' : '開始する'}
          >
            <Text style={[timerStyles.primaryBtnLabel, { color: colors.cream }]}>
              {state === 'paused' ? '再開する' : '開始する'}
            </Text>
          </Pressable>
        )}
        {state === 'running' && (
          <Pressable
            style={[timerStyles.primaryBtn, { backgroundColor: theme.bgSecondary, borderColor: theme.border, borderWidth: 0.5 }]}
            onPress={pause}
            accessibilityRole="button"
            accessibilityLabel="一時停止"
          >
            <Text style={[timerStyles.primaryBtnLabel, { color: theme.label }]}>
              一時停止
            </Text>
          </Pressable>
        )}
        {state !== 'idle' && (
          <Pressable
            style={timerStyles.resetBtn}
            onPress={reset}
            accessibilityRole="button"
            accessibilityLabel="リセット"
            hitSlop={8}
          >
            <Icon as={RotateCcw} size={16} color={colors.mist} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerLabel: {
    ...textStyle.micro,
  },
  time: {
    fontFamily: 'NotoSansJP-Medium',
    fontSize: 40,
    letterSpacing: 2,
    textAlign: 'center',
  },
  progressRow: {
    height: 2,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  doneLabel: {
    ...textStyle.body,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryBtnLabel: {
    ...textStyle.label,
    fontWeight: '500',
  },
  resetBtn: {
    padding: spacing.sm,
  },
});

// ─── CookingModeScreen ────────────────────────────────────────────────────────

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const { data: recipe, isLoading } = useRecipe(id ?? '');
  const createCookingRecord = useCreateCookingRecord();

  // YouTube インライン再生
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = recipe?.source_type === 'youtube' && recipe.source_url
    ? extractVideoId(recipe.source_url)
    : null;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [timerDoneVisible, setTimerDoneVisible] = useState(false);

  const steps = recipe?.steps ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = totalSteps > 0 ? (currentStepIndex + 1) / totalSteps : 0;

  const currentStep = steps[currentStepIndex];
  const timerSeconds = currentStep
    ? detectTimerSeconds(currentStep.text, currentStep.timer_seconds)
    : null;

  // ステップが変わったとき、タイムスタンプがあれば動画をそこにシーク
  useEffect(() => {
    const ts = currentStep?.video_timestamp_seconds;
    if (ts != null && playerRef.current) {
      playerRef.current.seekTo(ts, true);
      setIsPlaying(false); // シーク後は一時停止。ユーザーが手動で再生する
    }
  }, [currentStepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNext() {
    if (isLastStep) {
      createCookingRecord.mutate(
        { recipeId: id ?? '' },
        {
          onSuccess: () => setIsCompleted(true),
          onError: () => {
            setToastMessage('うまく記録できませんでした。記録は後から確認できます。');
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

  // ── 完了画面 ──────────────────────────────────────────────────────────────

  if (isCompleted) {
    const dishDescription = recipe?.title ?? '';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
        <View style={styles.completedContainer}>
          <Text style={[textStyle.title, { color: theme.label, textAlign: 'center' }]}>
            できあがりました。
          </Text>
          {dishDescription ? (
            <Text style={[textStyle.body, { color: theme.labelSecondary, textAlign: 'center' }]}>
              {dishDescription}。お疲れさまでした。
            </Text>
          ) : (
            <Text style={[textStyle.body, { color: theme.labelSecondary, textAlign: 'center' }]}>
              お疲れさまでした。
            </Text>
          )}
          <View style={styles.completedActions}>
            <Button
              label="記録する"
              onPress={() => router.replace('/(tabs)/me')}
            />
            <Button
              label="終わる"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── メイン画面 ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      <AppBar
        title={recipe?.title ?? ''}
        variant="small"
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
          {/* 進捗バー */}
          <View style={styles.progressContainer}>
            <ProgressBar value={progress} />
          </View>

          {/* ステップ番号 */}
          <View style={styles.stepIndicator}>
            <Text style={[textStyle.micro, { color: theme.labelTertiary }]}>
              {currentStepIndex + 1} / {totalSteps}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.stepContent}>
            {/* YouTube インライン再生（YouTube レシピは常に表示） */}
            {videoId && (
              <View style={styles.playerContainer}>
                <YoutubeIframe
                  ref={playerRef}
                  height={PLAYER_HEIGHT}
                  videoId={videoId}
                  play={isPlaying}
                  initialPlayerParams={{
                    modestbranding: true,
                    rel: 0,
                  }}
                  onChangeState={(event) => {
                    if (event === 'playing') setIsPlaying(true);
                    if (event === 'paused' || event === 'ended') setIsPlaying(false);
                  }}
                />
              </View>
            )}

            {/* ステップテキスト */}
            <Text style={[styles.stepText, { color: theme.label }]}>
              {currentStep?.text}
            </Text>

            {/* タイマーブロック（加熱・待機ステップのみ） */}
            {timerSeconds != null && (
              <TimerBlock
                key={`timer-${currentStepIndex}`}
                totalSeconds={timerSeconds}
                onDone={() => setTimerDoneVisible(true)}
              />
            )}
          </ScrollView>

          {/* フッター */}
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

      {/* 記録エラー Toast */}
      <Toast
        message={toastMessage}
        variant="negative"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* タイマー完了 Toast */}
      <Toast
        message="時間になりました。"
        variant="positive"
        visible={timerDoneVisible}
        onHide={() => setTimerDoneVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    padding: spacing.xl,
  },
  emptyState: { flex: 1 },

  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  stepIndicator: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },

  stepContent: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'flex-start',
  },
  stepText: {
    fontFamily: 'NotoSansJP-Medium',
    fontSize: 18,
    lineHeight: 30,
  },

  playerContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
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
  completedActions: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
