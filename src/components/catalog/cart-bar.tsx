import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { useGetCartQuery } from '@/store/customer-api'
import { formatPrice } from '@/utils/format'

/** Floating "View cart" bar for screens pushed over the tabs, where the Cart tab isn't visible. */
export function CartBar() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { data: cart } = useGetCartQuery()

  if (!cart?.totalItems) return null

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + Spacing.three }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${cart.totalItems} items, ${formatPrice(cart.totalAmount)}`}
        onPress={() => router.navigate('/customer/cart')}
        style={({ pressed }) => [styles.bar, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
        <Icon sf="cart.fill" md="shopping_cart" size={20} color={theme.onPrimary} />
        <ThemedText type="smallBold" style={[styles.text, { color: theme.onPrimary }]}>
          {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} · {formatPrice(cart.totalAmount)}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
          View cart
        </ThemedText>
        <Icon sf="chevron.right" md="chevron_right" size={16} color={theme.onPrimary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.full,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
  },
})
