import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { supabase } from '../../src/lib/supabase';

// OAuth コールバック処理 — Google Sign-In のリダイレクト先
export default function AuthCallbackScreen() {
  const router = useRouter();
  // useURL must be called at component level, not inside useEffect
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) return;

    // exchangeCodeForSession handles both PKCE (code=) and implicit (#tokens) flows
    supabase.auth
      .exchangeCodeForSession(url)
      .then(() => router.replace('/(tabs)/discover'))
      .catch(() => router.replace('/(auth)/sign-in'));
  }, [url, router]);

  return null;
}
