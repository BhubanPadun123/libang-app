import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'

import { ListingIcon, ListingImage } from '@/components/catalog/listing-image'
import { ThemedText } from '@/components/themed-text'
import { Card } from '@/components/ui/card'
import { Spacing } from '@/constants/theme'
import type { Seller, SellerType } from '@/types/catalog'

export function sellerSubtitle(seller: Seller, type: SellerType) {
  const count = seller.itemCount
  const noun = type === 'FOOD' ? 'dish' : 'product'
  const items = count ? `${count} ${noun}${count === 1 ? '' : type === 'FOOD' ? 'es' : 's'}` : 'New'
  return [seller.address?.city, items].filter(Boolean).join(' · ')
}

export function openSeller(seller: Seller, type: SellerType) {
  router.push({ pathname: '/customer/seller/[type]/[id]', params: { type, id: seller._id, name: seller.name } })
}

/** Compact card for horizontal seller rails on the home screen. */
export function SellerCard({ seller, type }: { seller: Seller; type: SellerType }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openSeller(seller, type)}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <ListingImage
          uri={seller.images[0]}
          fallback={ListingIcon[type === 'FOOD' ? 'RESTAURANT' : 'STORE']}
          style={styles.image}
        />
        <ThemedText type="smallBold" numberOfLines={1}>
          {seller.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
          {sellerSubtitle(seller, type)}
        </ThemedText>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    gap: Spacing.one,
  },
  image: {
    height: 100,
    marginBottom: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
})
