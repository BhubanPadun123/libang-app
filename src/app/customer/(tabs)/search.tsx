import { useState } from 'react'

import { ListingRow } from '@/components/catalog/listing-row'
import { QueryStatus } from '@/components/catalog/query-status'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { Section } from '@/components/ui/section'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useGetListingsQuery } from '@/store/customer-api'
import type { ListingType } from '@/types/catalog'

const Filters = ['All', 'Food', 'Products', 'Rooms'] as const
type Filter = (typeof Filters)[number]

const Groups: { filter: Exclude<Filter, 'All'>; type: ListingType }[] = [
  { filter: 'Food', type: 'FOOD' },
  { filter: 'Products', type: 'PRODUCT' },
  { filter: 'Rooms', type: 'ROOM' },
]

export default function CustomerSearchScreen() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const search = useDebouncedValue(query.trim())

  const results = {
    FOOD: useGetListingsQuery({ type: 'FOOD', search, limit: 20 }, { skip: !search }),
    PRODUCT: useGetListingsQuery({ type: 'PRODUCT', search, limit: 20 }, { skip: !search }),
    ROOM: useGetListingsQuery({ type: 'ROOM', search, limit: 20 }, { skip: !search }),
  }

  const groups = Groups.filter((g) => filter === 'All' || filter === g.filter)
  const settled = groups.every((g) => results[g.type].data || results[g.type].error)
  const empty = settled && groups.every((g) => !results[g.type].data?.items.length && !results[g.type].error)

  return (
    <Screen title="Search">
      <SearchField value={query} onChangeText={setQuery} placeholder="Search food, products, rooms…" />
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />

      {!search ? (
        <EmptyState
          icon={{ sf: 'magnifyingglass', md: 'search' }}
          title="What are you looking for?"
          message="Search dishes, groceries, products or a place to stay."
        />
      ) : empty ? (
        <EmptyState
          icon={{ sf: 'magnifyingglass', md: 'search_off' }}
          title="No results"
          message={`We couldn't find anything for "${search}".`}
        />
      ) : (
        groups.map(({ filter: label, type }) => {
          const result = results[type]
          const items = result.data?.items ?? []
          if (result.data && !items.length) return null
          return (
            <Section key={type} title={label}>
              <QueryStatus isLoading={result.isFetching && !result.data} error={result.error} onRetry={result.refetch} />
              {items.map((listing) => (
                <ListingRow key={listing._id} listing={listing} type={type} />
              ))}
            </Section>
          )
        })
      )}
    </Screen>
  )
}
