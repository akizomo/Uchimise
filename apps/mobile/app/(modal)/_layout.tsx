import { Stack } from 'expo-router';

import { useTheme } from '@uchimise/ui';

export default function ModalLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        contentStyle: { backgroundColor: theme.bgPage },
      }}
    >
      <Stack.Screen name="extract" />
    </Stack>
  );
}
