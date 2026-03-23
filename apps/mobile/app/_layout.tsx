import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// expo-share-intent requires a custom dev build — disabled for Expo Go
// import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';

import { useAuth } from '../src/hooks/useAuth';
import { registerForPushNotificationsAsync } from '../src/lib/notifications';
import { apiFetch } from '../src/lib/apiClient';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

// 認証状態に応じて画面をリダイレクト
function AuthGuard() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/discover');
    }
  }, [session, isLoading, segments, router]);

  return null;
}

// セッション確立後に Expo Push トークンを取得してサーバーへ登録
function PushTokenRegistrar() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    registerForPushNotificationsAsync().then((token) => {
      if (!token) return;
      // Fire-and-forget: failure is non-fatal
      apiFetch('/api/push-tokens', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }).catch(() => {});
    });
  }, [session?.user.id]); // re-register only when user changes

  return null;
}

// ShareIntentHandler: requires custom dev build, disabled for Expo Go

// Deep Link ハンドラ: uchimise://extract?url=...
function DeepLinkHandler() {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = Linking.parse(url);
      // uchimise://extract?url=https://...
      if (parsed.path === 'extract' && typeof parsed.queryParams?.url === 'string') {
        router.push({
          pathname: '/(modal)/extract',
          params: { url: parsed.queryParams.url },
        });
      }
    });

    // コールドスタート時の初期 URL も処理
    Linking.getInitialURL().then((initialUrl) => {
      if (!initialUrl) return;
      const parsed = Linking.parse(initialUrl);
      if (parsed.path === 'extract' && typeof parsed.queryParams?.url === 'string') {
        router.push({
          pathname: '/(modal)/extract',
          params: { url: parsed.queryParams.url },
        });
      }
    });

    return () => subscription.remove();
  }, [session, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    KleeOne: require('../assets/fonts/KleeOne-Regular.ttf'),
    'KleeOne-SemiBold': require('../assets/fonts/KleeOne-SemiBold.ttf'),
    NotoSansJP: require('../assets/fonts/NotoSansJP-Regular.ttf'),
    'NotoSansJP-Light': require('../assets/fonts/NotoSansJP-Light.ttf'),
    'NotoSansJP-Medium': require('../assets/fonts/NotoSansJP-Medium.ttf'),
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <AuthGuard />
        <PushTokenRegistrar />
        <DeepLinkHandler />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recipe/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="cooking/[id]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="plan/[weekStart]" options={{ presentation: 'card' }} />
          <Stack.Screen name="collection/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="feed/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/callback" />
        </Stack>
    </QueryClientProvider>
  );
}
