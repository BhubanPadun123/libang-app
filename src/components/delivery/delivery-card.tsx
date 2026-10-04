import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { Tone } from '@/components/ui/icon-bubble'
import { formatOrderDate } from '@/constants/order-status'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import type { DeliveryOrder } from '@/types/delivery'
import { formatPrice } from '@/utils/format'

/** Rider-facing status: a cancelled order overrides the delivery step. */
export function deliveryStage(order: DeliveryOrder): { label: string; tone: Tone } {
  if (order.status === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' }
  switch (order.delivery.status) {
    case 'PICKED_UP':
      return { label: 'Picked up', tone: 'primary' }
    case 'DELIVERED':
      return { label: 'Delivered', tone: 'success' }
    default:
      return { label: 'To pick up', tone: 'warning' }
  }
}

export function dropAddress(order: DeliveryOrder) {
  const a = order.deliveryAddress
  return [a?.address, a?.city, a?.pincode].filter(Boolean).join(', ')
}

export function openDelivery(order: DeliveryOrder) {
  router.push({ pathname: '/delivery/order/[id]', params: { id: order._id } })
}

/** Summary of one assigned order; tap for the map and actions. */
export function DeliveryCard({ order }: { order: DeliveryOrder }) {
  const theme = useTheme()
  const stage = deliveryStage(order)
  const pickupNames = order.pickups.map((p) => p.name).join(', ')

  return (
    <Pressable accessibilityRole="button" onPress={() => openDelivery(order)} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">
              {order.orderNumber} · {order.deliveryAddress?.name ?? 'Customer'}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {formatOrderDate(order.delivery.assignedAt ?? order.createdAt)}
            </ThemedText>
          </View>
          <Badge label={stage.label} tone={stage.tone} />
        </View>

        {pickupNames ? (
          <Row icon={<Icon sf="storefront.fill" md="storefront" size={16} color={theme.info} />} text={`Pick up: ${pickupNames}`} />
        ) : null}
        <Row icon={<Icon sf="mappin.and.ellipse" md="location_on" size={16} color={theme.primary} />} text={dropAddress(order) || 'No address'} />

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.flex}>
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · Cash on delivery
          </ThemedText>
          <ThemedText type="smallBold">Collect {formatPrice(order.totalAmount)}</ThemedText>
          <Icon sf="chevron.right" md="chevron_right" size={16} color={theme.textSecondary} />
        </View>
      </Card>
    </Pressable>
  )
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.row}>
      {icon}
      <ThemedText type="small" style={styles.flex} numberOfLines={2}>
        {text}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
})
