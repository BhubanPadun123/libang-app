import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { StyleSheet } from 'react-native'

import { ListingIcon, ListingImage } from '@/components/catalog/listing-image'
import { ListingRow } from '@/components/catalog/listing-row'
import { QueryStatus } from '@/components/catalog/query-status'
import { openSeller, sellerSubtitle } from '@/components/catalog/seller-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useGetListingsQuery, useGetSellersQuery } from '@/store/customer-api'
import type { ListingType, SellerType } from '@/types/catalog'

const Titles: Record<ListingType, { title: string; placeholder: string }> = {
  FOOD: { title: 'Restaurants', placeholder: 'Search restaurants' },
  PRODUCT: { title: 'Stores', placeholder: 'Search stores' },
  ROOM: { title: 'Rooms', placeholder: 'Search rooms' },
}

function isListingType(value: unknown): value is ListingType {
  return value === 'FOOD' || value === 'PRODUCT' || value === 'ROOM'
}

/** Food and products are browsed by seller; rooms are listed directly. */
export default function BrowseScreen() {
  const params = useLocalSearchParams<{ type: string }>()
  const type = isListingType(params.type) ? params.type : 'FOOD'
  const [query, setQuery] = useState('')
  const search = useDebouncedValue(query.trim())

  return (
    <>
      <Stack.Screen options={{ title: Titles[type].title }} />
      {type === 'ROOM' ? (
        <RoomList search={search} query={query} setQuery={setQuery} />
      ) : (
        <SellerList type={type} search={search} query={query} setQuery={setQuery} />
      )}
    </>
  )
}

type ListProps = { search: string; query: string; setQuery: (q: string) => void }

function SellerList({ type, search, query, setQuery }: ListProps & { type: SellerType }) {
  const sellers = useGetSellersQuery({ type, search })
  const items = sellers.data?.items ?? []

  return (
    <Screen safeTop={false} onRefresh={sellers.refetch} refreshing={sellers.isFetching && !sellers.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder={Titles[type].placeholder} />
      <QueryStatus isLoading={sellers.isLoading} error={sellers.error} onRetry={sellers.refetch} />
      {items.length ? (
        <ListCard>
          {items.map((seller) => (
            <ListItem
              key={seller._id}
              title={seller.name}
              subtitle={sellerSubtitle(seller, type)}
              leading={
                <ListingImage
                  uri={seller.images[0]}
                  fallback={ListingIcon[type === 'FOOD' ? 'RESTAURANT' : 'STORE']}
                  style={styles.thumb}
                />
              }
              onPress={() => openSeller(seller, type)}
            />
          ))}
        </ListCard>
      ) : sellers.data ? (
        <EmptyState
          icon={ListingIcon[type === 'FOOD' ? 'RESTAURANT' : 'STORE']}
          title={search ? 'No matches' : `No ${Titles[type].title.toLowerCase()} yet`}
          message={search ? `Nothing found for "${search}".` : 'Check back soon.'}
        />
      ) : null}
    </Screen>
  )
}

function RoomList({ search, query, setQuery }: ListProps) {
  const rooms = useGetListingsQuery({ type: 'ROOM', search })
  const items = rooms.data?.items ?? []

  return (
    <Screen safeTop={false} onRefresh={rooms.refetch} refreshing={rooms.isFetching && !rooms.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder={Titles.ROOM.placeholder} />
      <QueryStatus isLoading={rooms.isLoading} error={rooms.error} onRetry={rooms.refetch} />
      {items.map((room) => (
        <ListingRow key={room._id} listing={room} type="ROOM" />
      ))}
      {rooms.data && !items.length ? (
        <EmptyState
          icon={ListingIcon.ROOM}
          title={search ? 'No matches' : 'No rooms yet'}
          message={search ? `Nothing found for "${search}".` : 'Check back soon.'}
        />
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  thumb: {
    width: 48,
    height: 48,
  },
})
