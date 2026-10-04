import { Stack } from 'expo-router'

import { useTheme } from '@/hooks/use-theme'

/** Tabs, plus the listing editor pushed over them with a native back header. */
export default function MerchantLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.text },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listing" />
    </Stack>
  )
}
