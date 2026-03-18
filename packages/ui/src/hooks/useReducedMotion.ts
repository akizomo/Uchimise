import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * iOS「視差効果を減らす」設定を購読する hook。
 * true の場合、すべてのアニメーションを duration: 0 にフォールバックすること。
 *
 * @example
 * const reduced = useReducedMotion();
 * Animated.timing(val, {
 *   duration: reduced ? 0 : makeTimingConfig('sheetIn').duration,
 *   easing:   makeTimingConfig('sheetIn').easing,
 *   useNativeDriver: true,
 * }).start();
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);

  return reduced;
}
