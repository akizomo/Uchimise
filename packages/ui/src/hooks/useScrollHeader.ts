import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * AppBar のスクロール連動に使うフック。
 * scrollY を ScrollView の onScroll に渡すだけで大タイトル折りたたみが動く。
 *
 * @example
 * const { scrollY, onScroll } = useScrollHeader();
 * <AppBar title="棚" variant="large" scrollY={scrollY} />
 * <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 */
export function useScrollHeader() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  return { scrollY, onScroll, scrollEventThrottle: 16 as const };
}
