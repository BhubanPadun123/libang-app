import { isRunningInExpoGo } from 'expo'
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import { AppState, Platform } from 'react-native'

import type { OrderNotification } from '@/services/realtime'
import { formatPrice } from '@/utils/format'

type NotificationsModule = typeof import('expo-notifications')

const CHANNEL_ID = 'orders'

/**
 * System notifications need expo-notifications, which has no web support and logs an error
 * as soon as it's imported in Expo Go on Android (SDK 53+). There, only the in-app chime plays.
 */
const systemNotificationsSupported =
  Platform.OS !== 'web' && !(Platform.OS === 'android' && isRunningInExpoGo())

let notifications: Promise<NotificationsModule | null> | null = null

/** Loads expo-notifications on first use, so unsupported environments never import it. */
function loadNotifications() {
  if (!systemNotificationsSupported) return Promise.resolve(null)

  notifications ??= import('expo-notifications')
    .then(async (Notifications) => {
      // Only called while the app is open, where the in-app banner and chime already cover it.
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: true,
        }),
      })

      if (Platform.OS === 'android') {
        // Omitting `sound` uses the device's default notification sound.
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'New orders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        })
      }

      const current = await Notifications.getPermissionsAsync()
      const granted =
        current.granted ||
        (await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } }))
          .granted

      return granted ? Notifications : null
    })
    .catch(() => {
      notifications = null
      return null
    })

  return notifications
}

let chime: AudioPlayer | null = null

function getChime() {
  if (!chime) {
    // Don't stop music or calls the user has playing.
    setAudioModeAsync({ interruptionMode: 'mixWithOthers' }).catch(() => {})
    chime = createAudioPlayer(require('@/assets/sounds/new-order.wav'))
  }
  return chime
}

/**
 * Loads the chime and asks for notification permission. Runs once after sign-in for roles that
 * receive order alerts, so the first order isn't silent.
 */
export function prepareOrderAlerts() {
  getChime()
  void loadNotifications()
}

/** Chimes in the foreground; in the background, posts a system notification with sound. */
export async function playOrderAlert(order: OrderNotification) {
  if (AppState.currentState === 'active') {
    const player = getChime()
    await player.seekTo(0)
    player.play()
    return
  }

  const Notifications = await loadNotifications()
  if (!Notifications) return

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
  let removed = false
  let remove = () => {}

  loadNotifications().then((Notifications) => {
    if (!Notifications || removed) return
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.orderId) onOpen()
    })
    remove = () => subscription.remove()
  })

  return () => {
    removed = true
    remove()
  }
}
