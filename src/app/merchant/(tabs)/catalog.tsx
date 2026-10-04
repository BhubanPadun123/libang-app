import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet } from 'react-native'

import { ListingIcon, ListingImage } from '@/components/catalog/listing-image'
import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { Toggle } from '@/components/ui/toggle'
import { Merchant } from '@/constants/merchant'
import { isMerchantRole } from '@/constants/roles'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { getMerchantTabs } from '@/navigation/tabs'
import { errorMessage } from '@/store/customer-api'
import { useAppSelector } from '@/store/hooks'
import { useGetOwnerListingsQuery, useUpdateListingMutation } from '@/store/owner-api'
import type { ListingType } from '@/types/catalog'
import type { OwnerListing } from '@/types/owner'
import { formatPrice } from '@/utils/format'

function openEditor(id?: string) {
  router.push(id ? { pathname: '/merchant/listing', params: { id } } : '/merchant/listing')
}

export default function MerchantCatalogScreen() {
  const role = useAppSelector((s) => s.auth.user?.role)
  const merchant = isMerchantRole(role) ? role : 'store_owner'
  const copy = Merchant[merchant]
  const title = getMerchantTabs(merchant).find((t) => t.name === 'catalog')?.label ?? 'Catalog'

  const [query, setQuery] = useState('')
  const search = useDebouncedValue(query.trim())
  const listings = useGetOwnerListingsQuery({ search })
  const items = listings.data ?? []
  const available = items.filter((i) => i.isAvailable).length

  return (
    <Screen
      title={title}
      subtitle={listings.data && !search ? `${available} of ${items.length} available` : undefined}
      headerRight={<Button label="Add" size="sm" icon={{ sf: 'plus', md: 'add' }} onPress={() => openEditor()} />}
      onRefresh={listings.refetch}
      refreshing={listings.isFetching && !listings.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder={`Search ${title.toLowerCase()}`} />
      <QueryStatus isLoading={listings.isLoading} error={listings.error} onRetry={listings.refetch} />
      {items.length ? (
        <ListCard>
          {items.map((item) => (
            <CatalogRow key={item._id} item={item} type={copy.listingType} />
          ))}
        </ListCard>
      ) : listings.data ? (
        <EmptyState
          icon={ListingIcon[copy.listingType]}
          title={search ? 'No matches' : `Add your first ${copy.item}`}
          message={search ? `Nothing found for "${search}".` : 'Customers can order once you list something.'}
          action={search ? undefined : <Button label={`Add ${copy.item}`} onPress={() => openEditor()} />}
        />
      ) : null}
    </Screen>
  )
}

function CatalogRow({ item, type }: { item: OwnerListing; type: ListingType }) {
  const [update, state] = useUpdateListingMutation()
  // Show the requested value while saving, so the switch doesn't jump back.
  const value = state.isLoading ? !!state.originalArgs?.changes.isAvailable : item.isAvailable
  const detail = [type === 'ROOM' ? item.location?.city : item.category, formatPrice(item.price)]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <ListItem
        title={item.name}
        subtitle={detail}
        leading={<ListingImage uri={item.images[0]} fallback={ListingIcon[type]} style={styles.thumb} />}
        onPress={() => openEditor(item._id)}
        trailing={
          <Toggle
            value={value}
            disabled={state.isLoading}
            accessibilityLabel={`${item.name} available`}
            onValueChange={(isAvailable) => {
              update({ id: item._id, changes: { isAvailable } })
            }}
          />
        }
      />
      {state.error ? (
        <ThemedText type="caption" themeColor="danger" style={styles.error}>
          {errorMessage(state.error)}
        </ThemedText>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  thumb: {
    width: 44,
    height: 44,
  },
  error: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
})
