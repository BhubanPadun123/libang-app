import { StyleSheet } from 'react-native'

import { ListingIcon } from '@/components/catalog/listing-image'
import { OrderCard } from '@/components/order-card'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { formatOrderDate, OrderStatusLabel } from '@/constants/order-status'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/store/customer-api'
import { ownerStatus, useSetOrderStatusMutation } from '@/store/owner-api'
import type { ServerOrderStatus } from '@/types/catalog'
import type { OwnerOrder } from '@/types/owner'

function describeItems(order: OwnerOrder) {
  return order.items.map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.name}` : i.name)).join(', ')
}

function deliveryLine(order: OwnerOrder) {
  const a = order.deliveryAddress
  if (!a) return undefined
  const place = [a.address, a.city, a.pincode].filter(Boolean).join(', ')
  return [place, a.phone].filter(Boolean).join(' · ') || undefined
}

/** One order as the owner sees it, with the next step for their own lines. */
export function OwnerOrderCard({ order }: { order: OwnerOrder }) {
  const theme = useTheme()
  const [setStatus, state] = useSetOrderStatusMutation()
  const status = ownerStatus(order)

  const action = (label: string, next: ServerOrderStatus, variant?: 'secondary' | 'danger') => (
    <Button
      label={label}
      size="sm"
      variant={variant}
      loading={state.isLoading && state.originalArgs?.status === next}
      disabled={state.isLoading}
      onPress={() => setStatus({ orderId: order._id, status: next })}
    />
  )

  return (
    <>
      <OrderCard
        id={`#${order._id.slice(-6).toUpperCase()}`}
        title={order.deliveryAddress?.name || order.user?.name || 'Customer'}
        items={describeItems(order)}
        total={order.totalAmount}
        status={OrderStatusLabel[status]}
        time={formatOrderDate(order.createdAt)}
        icon={ListingIcon[order.items[0]?.listingType ?? 'PRODUCT']}
        details={deliveryLine(order)}
        actions={
          status === 'PENDING' ? (
            <>
              {action('Accept', 'CONFIRMED')}
              {action('Reject', 'CANCELLED', 'secondary')}
            </>
          ) : status === 'CONFIRMED' ? (
            <>
              {action('Mark delivered', 'DELIVERED')}
              {action('Cancel', 'CANCELLED', 'secondary')}
            </>
          ) : undefined
        }
      />
      {state.error ? (
        <ThemedText type="caption" style={[styles.error, { color: theme.danger }]}>
          {errorMessage(state.error)}
        </ThemedText>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  error: {
    marginTop: -8,
  },
})
