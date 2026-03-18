import { Redirect } from 'expo-router';

// Initial route: AuthGuard in _layout.tsx will redirect to sign-in or tabs.
// This file just provides a valid default route for Expo Router.
export default function Index() {
  return <Redirect href="/(tabs)/discover" />;
}
