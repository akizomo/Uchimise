import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { colors, radius, spacing, textStyle } from '@uchimise/tokens';
import { Button, useTheme } from '@uchimise/ui';

import { supabase } from '../../src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState<'apple' | 'google' | 'email' | null>(null);
  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');

  async function handleAppleSignIn() {
    setIsLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken ?? '',
      });

      if (error) throw error;
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code !== 'ERR_CANCELED') {
        Alert.alert('サインインできませんでした。もう一度試してみてください。');
      }
    } finally {
      setIsLoading(null);
    }
  }

  async function handleEmailSignIn() {
    if (!devEmail || !devPassword) return;
    setIsLoading('email');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });
      if (error) throw error;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('サインインできませんでした。', msg);
    } finally {
      setIsLoading(null);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading('google');
    try {
      const redirectTo = Linking.createURL('/auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) throw error ?? new Error('OAuth URL not returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (sessionError) throw sessionError;
      }
    } catch {
      Alert.alert('サインインできませんでした。もう一度試してみてください。');
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPage }]}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <Text style={[styles.logoText, { color: theme.label }]}>うちのお店</Text>
        <Text style={[styles.tagline, { color: theme.tint }]}>開けよう。</Text>
        <Text style={[textStyle.titleSm, { color: theme.label, textAlign: 'center', marginTop: spacing.xxl }]}>
          うちのお店へ、ようこそ。
        </Text>
        <Text style={[textStyle.body, { color: theme.labelSecondary, textAlign: 'center' }]}>
          SNSで見つけたレシピを、ここに並べてみませんか。
        </Text>
      </View>

      {/* Sign-in buttons */}
      <View style={styles.buttons}>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              theme.isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={radius.pill}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        <Button
          label="Google でサインイン"
          variant="secondary"
          onPress={handleGoogleSignIn}
          disabled={isLoading !== null}
          isLoading={isLoading === 'google'}
        />
      </View>

      {__DEV__ && (
        <View style={styles.devSection}>
          <Text style={[textStyle.micro, { color: theme.labelTertiary }]}>DEV</Text>
          <TextInput
            style={[styles.devInput, { color: theme.label, borderColor: theme.border }]}
            placeholder="email"
            placeholderTextColor={colors.mist}
            autoCapitalize="none"
            keyboardType="email-address"
            value={devEmail}
            onChangeText={setDevEmail}
          />
          <TextInput
            style={[styles.devInput, { color: theme.label, borderColor: theme.border }]}
            placeholder="password"
            placeholderTextColor={colors.mist}
            secureTextEntry
            value={devPassword}
            onChangeText={setDevPassword}
          />
          <Button
            label="メールでサインイン"
            variant="secondary"
            onPress={handleEmailSignIn}
            disabled={isLoading !== null}
            isLoading={isLoading === 'email'}
          />
        </View>
      )}

      <Text style={[textStyle.micro, { color: theme.labelTertiary, textAlign: 'center', marginTop: spacing.xl }]}>
        サインインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoText: {
    ...textStyle.h1,
    fontWeight: '600',
    letterSpacing: 2,
  },
  tagline: {
    ...textStyle.h2,
    letterSpacing: 4,
  },
  buttons: {
    gap: spacing.md,
  },
  appleButton: {
    height: 52,
    width: '100%',
  },
  devSection: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.mist,
  },
  devInput: {
    borderWidth: 0.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
});
