import * as Haptics from 'expo-haptics';

/**
 * アプリ全体で一貫した haptic フィードバックを提供する hook。
 * 直接 expo-haptics を呼ぶ代わりに、このhookを使うことで
 * 用途ごとの強度を一元管理する。
 *
 * @example
 * const haptics = useHaptics();
 * haptics.success();   // レシピ保存完了
 * haptics.selection(); // SegmentedControl・RadioButton 切替
 * haptics.error();     // バリデーションエラー
 */
export function useHaptics() {
  return {
    // ── 通知系 ──────────────────────────────────────────────────────────────
    /** レシピ保存・調理完了など肯定的な完了 */
    success:   () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    /** バリデーションエラー・操作不可 */
    error:     () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    /** 警告・注意が必要なアクション */
    warning:   () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

    // ── 衝撃系 ──────────────────────────────────────────────────────────────
    /** チェックボックス・Tag・Chip などの軽いフィードバック */
    light:     () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    /** Switch・Button などの標準フィードバック */
    medium:    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    /** 削除確認・破壊的操作などの重いフィードバック */
    heavy:     () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

    // ── 選択系 ──────────────────────────────────────────────────────────────
    /** SegmentedControl・RadioButton・リスト行の選択変更 */
    selection: () => Haptics.selectionAsync(),
  } as const;
}
