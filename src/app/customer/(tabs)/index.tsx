import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ListingRow } from '@/components/catalog/listing-row'
import { QueryStatus } from '@/components/catalog/query-status'
import { SellerCard } from '@/components/catalog/seller-card'
import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Icon, type IconName } from '@/components/ui/icon'
import { IconBubble, type Tone } from '@/components/ui/icon-bubble'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { useGetListingsQuery, useGetSellersQuery } from '@/store/customer-api'
import { useAppSelector } from '@/store/hooks'
import type { ListingType, Seller, SellerType } from '@/types/catalog'

const Categories: { label: string; type: ListingType; icon: IconName; tone: Tone }[] = [
  { label: 'Food', type: 'FOOD', icon: { sf: 'fork.knife', md: 'restaurant' }, tone: 'primary' },
  { label: 'Stores', type: 'PRODUCT', icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'info' },
  { label: 'Rooms', type: 'ROOM', icon: { sf: 'bed.double.fill', md: 'hotel' }, tone: 'warning' },
]

function browse(type: ListingType) {
  router.push({ pathname: '/customer/browse/[type]', params: { type } })
}

export default function CustomerHomeScreen() {
  const theme = useTheme()
  const name = useAppSelector((s) => s.auth.user?.name ?? '')

  const restaurants = useGetSellersQuery({ type: 'FOOD' })
  const stores = useGetSellersQuery({ type: 'PRODUCT' })
  const rooms = useGetListingsQuery({ type: 'ROOM', limit: 3 })

  const refreshing = restaurants.isFetching || stores.isFetching || rooms.isFetching
  const refresh = () => {
    restaurants.refetch()
    stores.refetch()
    rooms.refetch()
  }

  return (
    <Screen
      subtitle="LibangExpress"
      title={`Hi, ${name.split(' ')[0] || 'there'} 👋`}
      headerRight={<Avatar name={name} />}
      onRefresh={refresh}
      refreshing={refreshing && !restaurants.isLoading}>
      <Pressable
        accessibilityRole="search"
        onPress={() => router.navigate('/customer/search')}
        style={[styles.search, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Icon sf="magnifyingglass" md="search" size={20} color={theme.textSecondary} />
        <ThemedText themeColor="textSecondary">Search food, products, rooms…</ThemedText>
      </Pressable>

      <View style={styles.categories}>
        {Categories.map((c) => (
          <Pressable
            key={c.type}
            accessibilityRole="button"
            onPress={() => browse(c.type)}
            style={({ pressed }) => [styles.category, pressed && styles.pressed]}>
            <IconBubble icon={c.icon} tone={c.tone} size={56} />
            <ThemedText type="caption">{c.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <SellerRail
        title="Restaurants near you"
        type="FOOD"
        sellers={restaurants.data?.items}
        isLoading={restaurants.isLoading}
        error={restaurants.error}
        onRetry={restaurants.refetch}
      />
      <SellerRail
        title="Stores near you"
        type="PRODUCT"
        sellers={stores.data?.items}
        isLoading={stores.isLoading}
        error={stores.error}
        onRetry={stores.refetch}
      />

      <Section title="Rooms" actionLabel="See all" onAction={() => browse('ROOM')}>
        <QueryStatus isLoading={rooms.isLoading} error={rooms.error} onRetry={rooms.refetch} />
        {rooms.data?.items.map((room) => (
          <ListingRow key={room._id} listing={room} type="ROOM" />
        ))}
        {rooms.data && !rooms.data.items.length ? (
          <ThemedText themeColor="textSecondary">No rooms listed yet.</ThemedText>
        ) : null}
      </Section>
    </Screen>
  )
}

type SellerRailProps = {
  title: string
  type: SellerType
  /** Undefined until loaded. */
  sellers?: Seller[]
  isLoading: boolean
  error?: unknown
  onRetry: () => void
}

/** Hidden once loaded if there are no sellers of this type. */
function SellerRail({ title, type, sellers, isLoading, error, onRetry }: SellerRailProps) {
  if (sellers && !sellers.length) return null

  return (
    <Section title={title} actionLabel="See all" onAction={() => browse(type)}>
      <QueryStatus isLoading={isLoading} error={error} onRetry={onRetry} />
      {sellers?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {sellers.slice(0, 10).map((seller) => (
            <SellerCard key={seller._id} seller={seller} type={type} />
          ))}
        </ScrollView>
      ) : null}
    </Section>
  )
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categories: {
    flexDirection: 'row',
  },
  category: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  rail: {
    gap: Spacing.three,
  },
})
