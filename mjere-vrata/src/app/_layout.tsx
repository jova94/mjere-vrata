import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../components/ui';
import { StoreProvider } from '../lib/store';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: 'Назад',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Пројекти' }} />
        <Stack.Screen name="project/[id]" options={{ title: '' }} />
        <Stack.Screen name="project-form" options={{ presentation: 'modal', title: 'Пројекат' }} />
        <Stack.Screen name="door-form" options={{ presentation: 'modal', title: 'Врата' }} />
        <Stack.Screen name="settings" options={{ title: 'Подешавања' }} />
      </Stack>
    </StoreProvider>
  );
}
