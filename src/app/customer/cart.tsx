import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Radius, Spacing } from '@/constants/theme'
import { InitialCart, type CartItem } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { formatPrice } from '@/utils/format'

const DELIVERY_FEE = 30

// TODO: move the cart into a Redux slice once ordering is wired to the API.
export default function CustomerCartScreen() {
  const [items, setItems] = useState<CartItem[]>(InitialCart)

  const updateQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    )

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  if (!items.length) {
    return (
      <Screen title="Cart">
        <EmptyState
          icon={{ sf: 'cart', md: 'shopping_cart' }}
          title="Your cart is empty"
          message="Add something tasty from a restaurant or store nearby."
          action={<Button label="Browse" onPress={() => router.navigate('/customer')} />}
        />
      </Screen>
    )
  }

  return (
    <Screen title="Cart" subtitle={items[0]?.vendor}>
      <Card style={styles.items}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemText}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {formatPrice(item.price)}
              </ThemedText>
            </View>
            <Stepper value={item.qty} onChange={(delta) => updateQty(item.id, delta)} />
          </View>
        ))}
      </Card>

      <Card>
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Delivery fee" value={formatPrice(DELIVERY_FEE)} />
        <Row label="Total" value={formatPrice(subtotal + DELIVERY_FEE)} bold />
      </Card>

      <Button label={`Checkout · ${formatPrice(subtotal + DELIVERY_FEE)}`} block />
    </Screen>
  )
}

function Stepper({ value, onChange }: { value: number; onChange: (delta: number) => void }) {
  const theme = useTheme()
  return (
    <View style={[styles.stepper, { backgroundColor: theme.primarySoft }]}>
      <Pressable hitSlop={8} onPress={() => onChange(-1)} accessibilityLabel="Decrease quantity">
        <Icon sf="minus" md="remove" size={16} color={theme.primary} />
      </Pressable>
      <ThemedText type="smallBold" themeColor="primary" style={styles.qty}>
        {value}
      </ThemedText>
      <Pressable hitSlop={8} onPress={() => onChange(1)} accessibilityLabel="Increase quantity">
        <Icon sf="plus" md="add" size={16} color={theme.primary} />
      </Pressable>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemText: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  qty: {
    minWidth: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
