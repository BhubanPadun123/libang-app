import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ListingIcon } from '@/components/catalog/listing-image'
import { OrderCard } from '@/components/order-card'
import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { formatOrderDate, OrderStatusLabel } from '@/constants/order-status'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import {
  useAssignDeliveryPartnerMutation,
  useGetDeliveryPartnersQuery,
  useSetAdminOrderStatusMutation,
} from '@/store/admin-api'
import { errorMessage } from '@/store/customer-api'
import type { AdminOrder } from '@/types/admin'
import type { DeliveryStatus, ServerOrderStatus } from '@/types/catalog'
import { callPhone } from '@/utils/contact'

const DeliveryLabel: Record<DeliveryStatus, string> = {
  ASSIGNED: 'Assigned',
  PICKED_UP: 'On the way',
  DELIVERED: 'Delivered',
}

function describeItems(order: AdminOrder) {
  return order.items.map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}`).join(', ')
}

function deliveryLine(order: AdminOrder) {
  const a = order.deliveryAddress
  if (!a) return undefined
  return [a.address, a.city, a.pincode].filter(Boolean).join(', ') || undefined
}

/** Unique sellers in the order, for the "call seller" buttons. */
function sellers(order: AdminOrder) {
  const byId = new Map<string, { name: string; phone?: string }>()
  order.items.forEach((i) => {
    if (i.owner?._id && !byId.has(i.owner._id)) byId.set(i.owner._id, { name: i.owner.name ?? 'Seller', phone: i.owner.phone })
  })
  return Array.from(byId.values())
}

/**
 * Any order on the platform. Admins can update its status, phone the customer or sellers,
 * and assign the delivery partner. Platform fees aren't shown; they're super-admin only.
 */
export function AdminOrderCard({ order }: { order: AdminOrder }) {
  const theme = useTheme()
  const [setStatus, state] = useSetAdminOrderStatusMutation()
  const customerPhone = order.deliveryAddress?.phone || order.user?.phone
  const delivery = order.delivery
  const canAssign = order.status !== 'CANCELLED' && delivery?.status !== 'DELIVERED'

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
      footer={
        <>
          {state.error ? (
            <ThemedText type="caption" themeColor="danger">
              {errorMessage(state.error)}
            </ThemedText>
          ) : null}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="caption" themeColor="textSecondary">
            Contact
          </ThemedText>
          <View style={styles.wrap}>
            <Button
              label="Call customer"
              size="sm"
              variant="secondary"
              icon={{ sf: 'phone.fill', md: 'call' }}
              disabled={!customerPhone}
              onPress={() => callPhone(customerPhone)}
            />
            {sellers(order).map((seller) => (
              <Button
                key={seller.name}
                label={`Call ${seller.name}`}
                size="sm"
                variant="secondary"
                icon={{ sf: 'storefront.fill', md: 'storefront' }}
                disabled={!seller.phone}
                onPress={() => callPhone(seller.phone)}
              />
            ))}
          </View>

          <DeliverySection order={order} canAssign={canAssign} />
        </>
      }
    />
  )
}

function DeliverySection({ order, canAssign }: { order: AdminOrder; canAssign: boolean }) {
  const delivery = order.delivery
  const [picking, setPicking] = useState(false)
  const partners = useGetDeliveryPartnersQuery(undefined, { skip: !picking })
  const [assign, assignState] = useAssignDeliveryPartnerMutation()

  const choose = async (partnerId: string | null) => {
    try {
      await assign({ orderId: order._id, partnerId }).unwrap()
      setPicking(false)
    } catch {
      // Shown below from assignState.error.
    }
  }

  return (
    <>
      <ThemedText type="caption" themeColor="textSecondary">
        Delivery
      </ThemedText>
      {delivery?.partner ? (
        <View style={styles.row}>
          <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
            {delivery.partner.name ?? 'Delivery partner'}
          </ThemedText>
          <Badge label={DeliveryLabel[delivery.status]} tone={delivery.status === 'DELIVERED' ? 'success' : 'info'} />
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          No delivery partner yet
        </ThemedText>
      )}

      <View style={styles.wrap}>
        {delivery?.partner?.phone ? (
          <Button
            label="Call rider"
            size="sm"
            variant="secondary"
            icon={{ sf: 'bicycle', md: 'two_wheeler' }}
            onPress={() => callPhone(delivery.partner?.phone)}
          />
        ) : null}
        {canAssign ? (
          <Button
            label={picking ? 'Close' : delivery?.partner ? 'Change rider' : 'Assign rider'}
            size="sm"
            variant={delivery?.partner || picking ? 'secondary' : undefined}
            icon={picking ? undefined : { sf: 'person.badge.plus', md: 'person_add' }}
            onPress={() => setPicking((p) => !p)}
          />
        ) : null}
      </View>

      {picking ? (
        <View style={styles.picker}>
          {partners.isLoading ? (
            <ThemedText type="caption" themeColor="textSecondary">
              Loading delivery partners…
            </ThemedText>
          ) : partners.error ? (
            <ThemedText type="caption" themeColor="danger">
              {errorMessage(partners.error)}
            </ThemedText>
          ) : partners.data?.length ? (
            <View style={styles.wrap}>
              {partners.data.map((p) => (
                <Chip
                  key={p._id}
                  label={`${p.name}${p.activeDeliveries ? ` · ${p.activeDeliveries} active` : ' · free'}`}
                  selected={p._id === delivery?.partner?._id}
                  onPress={assignState.isLoading || p._id === delivery?.partner?._id ? undefined : () => choose(p._id)}
                />
              ))}
              {delivery?.partner ? (
                <Chip label="Unassign" onPress={assignState.isLoading ? undefined : () => choose(null)} />
              ) : null}
            </View>
          ) : (
            <ThemedText type="caption" themeColor="textSecondary">
              No delivery partners yet. A super admin can give someone the Delivery partner role from the Team tab.
            </ThemedText>
          )}
        </View>
      ) : null}

      {assignState.error ? (
        <ThemedText type="caption" themeColor="danger">
          {errorMessage(assignState.error)}
        </ThemedText>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  picker: {
    gap: Spacing.two,
  },
})
