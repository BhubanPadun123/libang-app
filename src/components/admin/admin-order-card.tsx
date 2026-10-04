import { ListingIcon } from '@/components/catalog/listing-image'
import { OrderCard } from '@/components/order-card'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { formatOrderDate, OrderStatusLabel } from '@/constants/order-status'
import { errorMessage } from '@/store/customer-api'
import { useSetAdminOrderStatusMutation } from '@/store/admin-api'
import type { AdminOrder } from '@/types/admin'
import type { ServerOrderStatus } from '@/types/catalog'

function describeItems(order: AdminOrder) {
  return order.items
    .map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}${i.owner?.name ? ` (${i.owner.name})` : ''}`)
    .join(', ')
}

function deliveryLine(order: AdminOrder) {
  const a = order.deliveryAddress
  if (!a) return undefined
  const place = [a.address, a.city, a.pincode].filter(Boolean).join(', ')
  return [place, a.phone].filter(Boolean).join(' · ') || undefined
}

/** Any order on the platform. An admin's status change applies to every line in it. */
export function AdminOrderCard({ order }: { order: AdminOrder }) {
  const [setStatus, state] = useSetAdminOrderStatusMutation()

  const action = (label: string, next: ServerOrderStatus, variant?: 'secondary') => (
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
        status={OrderStatusLabel[order.status]}
        time={formatOrderDate(order.createdAt)}
        icon={ListingIcon[order.items[0]?.listingType ?? 'PRODUCT']}
        details={deliveryLine(order)}
        actions={
          order.status === 'PENDING' ? (
            <>
              {action('Confirm', 'CONFIRMED')}
              {action('Cancel', 'CANCELLED', 'secondary')}
            </>
          ) : order.status === 'CONFIRMED' ? (
            <>
              {action('Mark delivered', 'DELIVERED')}
              {action('Cancel', 'CANCELLED', 'secondary')}
            </>
          ) : undefined
        }
      />
      {state.error ? (
        <ThemedText type="caption" themeColor="danger">
          {errorMessage(state.error)}
        </ThemedText>
      ) : null}
    </>
  )
}
