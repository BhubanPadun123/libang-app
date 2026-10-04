import { router } from 'expo-router'
import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { IconBubble } from '@/components/ui/icon-bubble'
import { ordersRoute } from '@/constants/roles'
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toastDismissed } from '@/store/slices/notifications-slice'
import { formatPrice } from '@/utils/format'

const VISIBLE_MS = 5_000

/** Banner that slides in from the top when a live order arrives. Tap to open the orders list. */
export function LiveOrderToast() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const order = useAppSelector((s) => s.notifications.toast)
  const role = useAppSelector((s) => s.auth.user?.role)

  useEffect(() => {
    if (!order) return
    const timer = setTimeout(() => dispatch(toastDismissed()), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [order, dispatch])

  if (!order) return null

  const open = () => {
    dispatch(toastDismissed())
    const route = ordersRoute(role)
    if (route) router.navigate(route)
  }

  return (
    <Animated.View
      key={order.id}
      entering={SlideInUp}
      exiting={SlideOutUp}
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + Spacing.two }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`New order ${order.orderNumber} from ${order.customerName}. Open orders.`}
        accessibilityLiveRegion="polite"
        onPress={open}
        style={({ pressed }) => [
          styles.toast,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <IconBubble icon={{ sf: 'bell.badge.fill', md: 'notifications_active' }} tone="primary" />
        <View style={styles.text}>
          <ThemedText type="smallBold" numberOfLines={1}>
            New order {order.orderNumber} · {formatPrice(order.total)}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {order.customerName} → {order.vendorName} · {order.itemsSummary}
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={12}
          onPress={() => dispatch(toastDismissed())}>
          <Icon sf="xmark" md="close" size={16} color={theme.textSecondary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
})
