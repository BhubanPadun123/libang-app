import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useColorScheme } from 'react-native'
import { AnimatedSplashOverlay } from '@/components/animated-icon'
import { PaperProvider } from 'react-native-paper'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useAppSelector } from '@/store/hooks'
import { isMerchantRole } from '@/constants/roles'

SplashScreen.preventAutoHideAsync()
export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <Provider store={store}>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </ThemeProvider>
      </PaperProvider>
    </Provider>
  )
}

function RootNavigator() {
  const role = useAppSelector((s) => s.auth.user?.role)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* `index` is unguarded: it redirects to sign-in or the current role's home. */}
      <Stack.Screen name="index" />

      <Stack.Protected guard={!role}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'customer'}>
        <Stack.Screen name="customer" />
      </Stack.Protected>

      <Stack.Protected guard={isMerchantRole(role)}>
        <Stack.Screen name="merchant" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'delivery'}>
        <Stack.Screen name="delivery" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'super_admin'}>
        <Stack.Screen name="super-admin" />
      </Stack.Protected>
    </Stack>
  )
}
