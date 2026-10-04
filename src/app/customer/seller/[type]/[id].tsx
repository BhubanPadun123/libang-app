import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'

import { CartBar } from '@/components/catalog/cart-bar'
import { ListingIcon } from '@/components/catalog/listing-image'
import { ListingRow } from '@/components/catalog/listing-row'
import { QueryStatus } from '@/components/catalog/query-status'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useGetListingsQuery } from '@/store/customer-api'
import type { SellerType } from '@/types/catalog'

/** One restaurant's menu or one store's products. */
export default function SellerScreen() {
  const params = useLocalSearchParams<{ type: string; id: string; name?: string }>()
  const type: SellerType = params.type === 'PRODUCT' ? 'PRODUCT' : 'FOOD'
  const [query, setQuery] = useState('')
  const search = useDebouncedValue(query.trim())

  const listings = useGetListingsQuery({ type, ownerId: params.id, search })
  const items = listings.data?.items ?? []

  return (
    <>
      <Stack.Screen options={{ title: params.name || (type === 'FOOD' ? 'Menu' : 'Products') }} />
      <Screen safeTop={false} onRefresh={listings.refetch} refreshing={listings.isFetching && !listings.isLoading}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={type === 'FOOD' ? 'Search the menu' : 'Search products'}
        />
        <QueryStatus isLoading={listings.isLoading} error={listings.error} onRetry={listings.refetch} />
        {items.map((listing) => (
          <ListingRow key={listing._id} listing={listing} type={type} />
        ))}
        {listings.data && !items.length ? (
          <EmptyState
            icon={ListingIcon[type]}
            title={search ? 'No matches' : 'Nothing listed yet'}
            message={search ? `Nothing found for "${search}".` : 'This seller has no items available right now.'}
          />
        ) : null}
      </Screen>
      <CartBar />
    </>
  )
}
