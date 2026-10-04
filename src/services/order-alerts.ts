import * as Notifications from 'expo-notifications'
import { AppState, Platform } from 'react-native'

import type { OrderNotification } from '@/services/realtime'
import { formatPrice } from '@/utils/format'

const CHANNEL_ID = 'orders'

// expo-notifications has no web support; the in-app banner still shows there, silently.
const supported = Platform.OS !== 'web'

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      // In the foreground the in-app banner already shows the order, so only play the sound.
      const foreground = AppState.currentState === 'active'
      return {
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: !foreground,
        shouldShowList: true,
      }
    },
  })
}

let prepared: Promise<boolean> | null = null

/**
 * Creates the Android channel (sound + vibration) and asks for permission. Without permission
 * the OS plays no sound, so this runs once after sign-in for roles that receive order alerts.
 */
export function prepareOrderAlerts(): Promise<boolean> {
  if (!supported) return Promise.resolve(false)

  prepared ??= (async () => {
    if (Platform.OS === 'android') {
      // Omitting `sound` uses the device's default notification sound.
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'New orders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const current = await Notifications.getPermissionsAsync()
    if (current.granted) return true

    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    })
    return requested.granted
  })().catch(() => {
    prepared = null
    return false
  })

  return prepared
}

/** Plays the notification sound for a new order, with a system banner if the app is in the background. */
export async function playOrderAlert(order: OrderNotification) {
  if (!(await prepareOrderAlerts())) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New order ${order.orderNumber} · ${formatPrice(order.total)}`,
      body: `${order.customerName} → ${order.vendorName} · ${order.itemsSummary}`,
      sound: 'default',
      data: { orderId: order.id },
    },
    // Android 8+ takes sound and importance from the channel.
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  })
}

/** Calls `onOpen` when the user taps an order notification. Returns an unsubscribe function. */
export function onOrderAlertOpened(onOpen: () => void) {
  if (!supported) return () => {}
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.content.data?.orderId) onOpen()
  })
  return () => subscription.remove()
}
