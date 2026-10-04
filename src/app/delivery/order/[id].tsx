import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { QueryStatus } from '@/components/catalog/query-status'
import { deliveryStage, dropAddress } from '@/components/delivery/delivery-card'
import { DeliveryMap, type MapPoint } from '@/components/delivery/delivery-map'
import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { Spacing } from '@/constants/theme'
import { errorMessage } from '@/store/customer-api'
import { useAdvanceDeliveryMutation, useGeocodeAddressQuery, useGetDeliveriesQuery } from '@/store/delivery-api'
import type { DeliveryOrder } from '@/types/delivery'
import { callPhone, hasCoordinates, openDirections } from '@/utils/contact'
import { formatPrice } from '@/utils/format'

/** One assigned order: where to go on a map, who to call, and the next step. */
export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const deliveries = useGetDeliveriesQuery()
  const order = deliveries.data?.find((o) => o._id === id)

  return (
    <>
      <Stack.Screen options={{ title: order ? `Delivery ${order.orderNumber}` : 'Delivery' }} />
      {order ? (
        <DeliveryDetail order={order} refreshing={deliveries.isFetching} onRefresh={deliveries.refetch} />
      ) : (
        <Screen safeTop={false}>
          <QueryStatus isLoading={deliveries.isLoading} error={deliveries.error} onRetry={deliveries.refetch} />
          {deliveries.data ? (
            <EmptyState
              icon={{ sf: 'shippingbox', md: 'package_2' }}
              title="Delivery not found"
              message="It may have been reassigned to someone else."
            />
          ) : null}
        </Screen>
      )}
    </>
  )
}

function DeliveryDetail({
  order,
  refreshing,
  onRefresh,
}: {
  order: DeliveryOrder
  refreshing: boolean
  onRefresh: () => void
}) {
  const address = order.deliveryAddress
  const pinned = hasCoordinates(address)
  // Orders placed without a shared location fall back to geocoding the typed address.
  const geocoded = useGeocodeAddressQuery(
    { address: address.address, city: address.city, pincode: address.pincode },
    { skip: pinned }
  )
  const drop = pinned
    ? { latitude: address.latitude!, longitude: address.longitude!, approximate: false }
    : geocoded.data ?? null

  const points: MapPoint[] = [
    ...(drop ? [{ ...drop, title: address.name || 'Customer', description: dropAddress(order), kind: 'drop' as const }] : []),
    ...order.pickups.filter(hasCoordinates).map((p) => ({
      latitude: p.latitude!,
      longitude: p.longitude!,
      title: p.name,
      description: 'Pick up here',
      kind: 'pickup' as const,
    })),
  ]

  const stage = deliveryStage(order)
  const done = order.status === 'CANCELLED' || order.delivery.status === 'DELIVERED'

  return (
    <Screen safeTop={false} onRefresh={onRefresh} refreshing={refreshing}>
      {points.length ? (
        <DeliveryMap points={points} />
      ) : geocoded.isFetching ? (
        <ThemedText themeColor="textSecondary">Finding the address on the map…</ThemedText>
      ) : (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            This address couldn&apos;t be placed on the map. Use Directions, or call the customer.
          </ThemedText>
        </Card>
      )}
      {drop?.approximate ? (
        <ThemedText type="caption" themeColor="warning">
          Approximate pin (city and PIN code only). Call the customer for the exact spot.
        </ThemedText>
      ) : null}

      <Section title="Deliver to">
        <Card style={styles.card}>
          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.flex}>
              {address.name}
            </ThemedText>
            <Badge label={stage.label} tone={stage.tone} />
          </View>
          <ThemedText type="small">{dropAddress(order) || 'No address given'}</ThemedText>
          {address.state ? (
            <ThemedText type="caption" themeColor="textSecondary">
              {address.state}
            </ThemedText>
          ) : null}
          <View style={styles.actions}>
            <Button
              label="Directions"
              size="sm"
              icon={{ sf: 'location.fill', md: 'navigation' }}
              onPress={() => openDirections({ ...(drop ?? {}), address: dropAddress(order) })}
            />
            <Button
              label="Call customer"
              size="sm"
              variant="secondary"
              icon={{ sf: 'phone.fill', md: 'call' }}
              disabled={!address.phone}
              onPress={() => callPhone(address.phone)}
            />
          </View>
        </Card>
      </Section>

      <Section title={order.pickups.length > 1 ? `Pick up from ${order.pickups.length} sellers` : 'Pick up from'}>
        {order.pickups.map((p) => (
          <Card key={p.ownerId} style={styles.card}>
            <ThemedText type="smallBold">{p.name}</ThemedText>
            {p.address ? <ThemedText type="small">{p.address}</ThemedText> : null}
            <ThemedText type="caption" themeColor="textSecondary">
              {p.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
            </ThemedText>
            <View style={styles.actions}>
              <Button
                label="Directions"
                size="sm"
                variant="secondary"
                icon={{ sf: 'location.fill', md: 'navigation' }}
                disabled={!hasCoordinates(p) && !p.address}
                onPress={() => openDirections(p)}
              />
              <Button
                label="Call seller"
                size="sm"
                variant="secondary"
                icon={{ sf: 'phone.fill', md: 'call' }}
                disabled={!p.phone}
                onPress={() => callPhone(p.phone)}
              />
            </View>
          </Card>
        ))}
      </Section>

      <Card style={styles.card}>
        <View style={styles.header}>
          <ThemedText style={styles.flex}>Cash to collect</ThemedText>
          <ThemedText type="heading">{formatPrice(order.totalAmount)}</ThemedText>
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          Cash on delivery · {order.items.reduce((n, i) => n + i.quantity, 0)} items
        </ThemedText>
      </Card>

      {!done ? <NextStep order={order} /> : null}
    </Screen>
  )
}

/** Confirm pickup, then mark delivered. Delivering asks for a second tap. */
function NextStep({ order }: { order: DeliveryOrder }) {
  const [advance, state] = useAdvanceDeliveryMutation()
  const [confirming, setConfirming] = useState(false)
  const pickedUp = order.delivery.status === 'PICKED_UP'

  const onPress = () => {
    if (!pickedUp) {
      advance({ orderId: order._id, status: 'PICKED_UP' })
      return
    }
    if (!confirming) {
      setConfirming(true)
      return
    }
    advance({ orderId: order._id, status: 'DELIVERED' })
  }

  return (
    <>
      {state.error ? (
        <ThemedText type="small" themeColor="danger">
          {errorMessage(state.error)}
        </ThemedText>
      ) : null}
      <Button
        label={
          !pickedUp
            ? 'Confirm pickup'
            : confirming
              ? `Tap again: collected ${formatPrice(order.totalAmount)} & delivered`
              : 'Mark delivered'
        }
        icon={pickedUp ? { sf: 'checkmark.circle.fill', md: 'check_circle' } : { sf: 'shippingbox.fill', md: 'package_2' }}
        loading={state.isLoading}
        onPress={onPress}
        block
      />
    </>
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
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
})
