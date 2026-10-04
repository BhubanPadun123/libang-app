import { Stack } from 'expo-router'

import { useTheme } from '@/hooks/use-theme'

/** Tabs, plus the delivery details (with the map) pushed over them. */
export default function DeliveryLayout() {
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
      <Stack.Screen name="order/[id]" options={{ title: 'Delivery' }} />
    </Stack>
  )
}
