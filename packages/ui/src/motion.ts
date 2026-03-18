/**
 * Motion helpers — packages/ui 層
 *
 * @uchimise/tokens の easingParams (純粋な数値) を react-native の Easing 関数に変換し、
 * makeTimingConfig() で Animated.timing に渡せる設定オブジェクトを生成する。
 *
 * @example
 * import { makeTimingConfig, easing } from '../motion';
 *
 * // プリセットを使う
 * Animated.timing(val, { ...makeTimingConfig('sheetIn'), useNativeDriver: true }).start();
 *
 * // Easing 単体で使う
 * Animated.timing(val, { duration: 250, easing: easing.decelerate, useNativeDriver: true }).start();
 */
import { Easing } from 'react-native';

import { easingParams, transition as transitionTokens } from '@uchimise/tokens';
import type { EasingPreset, TransitionPreset } from '@uchimise/tokens';

/** 名前付きイージング関数 */
export const easing: Record<EasingPreset, ReturnType<typeof Easing.bezier>> = {
  standard:   Easing.bezier(...easingParams.standard),
  decelerate: Easing.bezier(...easingParams.decelerate),
  accelerate: Easing.bezier(...easingParams.accelerate),
  emphasized: Easing.bezier(...easingParams.emphasized),
};

/**
 * Animated.timing に渡す { duration, easing } を生成する。
 * useNativeDriver は呼び出し元で付加すること。
 *
 * @example
 * Animated.timing(val, { ...makeTimingConfig('fadeIn'), useNativeDriver: true })
 */
export function makeTimingConfig(preset: TransitionPreset) {
  const t = transitionTokens[preset];
  return {
    duration: t.duration,
    easing:   easing[t.easing],
  };
}
