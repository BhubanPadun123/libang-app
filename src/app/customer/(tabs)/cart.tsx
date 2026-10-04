import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ListingIcon, ListingImage } from '@/components/catalog/listing-image'
import { QuantityStepper } from '@/components/catalog/quantity-stepper'
import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { Spacing } from '@/constants/theme'
import { useCartLine } from '@/hooks/use-cart-line'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage, useGetCartQuery, useRemoveFromCartMutation } from '@/store/customer-api'
import type { CartItem } from '@/types/catalog'
import { formatPrice } from '@/utils/format'

export default function CustomerCartScreen() {
  const cart = useGetCartQuery()
  const items = cart.data?.items ?? []
  const charges = cart.data?.charges
  const orderable = items.some((i) => i.available)

  if (cart.data && !items.length) {
    return (
      <Screen title="Cart" onRefresh={cart.refetch} refreshing={cart.isFetching}>
        <EmptyState
          icon={{ sf: 'cart', md: 'shopping_cart' }}
          title="Your cart is empty"
          message="Add something from a restaurant, store or stay nearby."
          action={<Button label="Browse" onPress={() => router.navigate('/customer')} />}
        />
      </Screen>
    )
  }

  return (
    <Screen
      title="Cart"
      subtitle={cart.data ? `${cart.data.totalItems} ${cart.data.totalItems === 1 ? 'item' : 'items'}` : undefined}
      onRefresh={cart.refetch}
      refreshing={cart.isFetching && !cart.isLoading}>
      <QueryStatus isLoading={cart.isLoading} error={cart.error} onRetry={cart.refetch} />

      {items.length ? (
        <Card style={styles.items}>
          {items.map((item) => (
            <CartLine key={`${item.listingType}:${item.listingId}`} item={item} />
          ))}
        </Card>
      ) : null}

      {charges && orderable ? (
        <>
          <Card style={styles.summary}>
            <Row label="Items" value={formatPrice(charges.itemsTotal)} />
            <Row label="Platform fee" value={charges.platformFee ? formatPrice(charges.platformFee) : 'Free'} />
            <Row label="Delivery fee" value={charges.deliveryFee ? formatPrice(charges.deliveryFee) : 'Free'} />
            <Row label="Total" value={formatPrice(charges.totalAmount)} bold />
          </Card>
          <Button
            label={`Checkout · ${formatPrice(charges.totalAmount)}`}
            onPress={() => router.push('/customer/checkout')}
            block
          />
        </>
      ) : null}
    </Screen>
  )
}

function CartLine({ item }: { item: CartItem }) {
  const theme = useTheme()
  const line = useCartLine(item.listingType, item.listingId)
  const [remove, removeState] = useRemoveFromCartMutation()
  const error = line.error ?? (removeState.error ? errorMessage(removeState.error) : null)

  return (
    <View style={styles.lineWrap}>
      <View style={styles.line}>
        <ListingImage uri={item.image} fallback={ListingIcon[item.listingType]} style={styles.thumb} />
        <View style={styles.lineText}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {formatPrice(item.price)}
            {item.itemPlatformFee + item.itemDeliveryFee > 0
              ? ` + ${formatPrice(item.itemPlatformFee + item.itemDeliveryFee)} fees`
              : ''}
          </ThemedText>
          {!item.available ? <Badge label="No longer available" tone="danger" /> : null}
        </View>
        {item.available ? (
          <QuantityStepper value={item.quantity} onChange={line.change} busy={line.busy} />
        ) : (
          <Button
            label="Remove"
            size="sm"
            variant="secondary"
            loading={removeState.isLoading}
            onPress={() => remove({ listingType: item.listingType, listingId: item.listingId })}
          />
        )}
      </View>
      {error ? (
        <ThemedText type="caption" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={bold ? 'heading' : 'smallBold'}>{value}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  items: {
    gap: Spacing.three,
  },
  lineWrap: {
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  thumb: {
    width: 52,
    height: 52,
  },
  lineText: {
    flex: 1,
    gap: 2,
  },
  summary: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
