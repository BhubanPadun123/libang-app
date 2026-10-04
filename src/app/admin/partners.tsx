import { useState } from 'react'

import { BusinessCard, partnerStatus, type PartnerStatus } from '@/components/admin/business-card'
import { QueryStatus } from '@/components/catalog/query-status'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { useGetBusinessesQuery } from '@/store/admin-api'

const Filters = ['Submitted', 'Approved', 'Live', 'Rejected', 'Draft', 'All'] as const
type Filter = (typeof Filters)[number]

export default function AdminPartnersScreen() {
  const [filter, setFilter] = useState<Filter>('Submitted')
  const [query, setQuery] = useState('')
  const result = useGetBusinessesQuery()

  const live = new Set(result.data?.liveIds ?? [])
  const q = query.trim().toLowerCase()
  const businesses = (result.data?.businesses ?? []).filter((b) => {
    const status: PartnerStatus = partnerStatus(b, live.has(b._id))
    const text = [b.business.name, b.business.address?.city, b.owner?.name, b.owner?.phone].join(' ').toLowerCase()
    return (filter === 'All' || status === filter) && (!q || text.includes(q))
  })
  const waiting = (result.data?.businesses ?? []).filter((b) => b.onboarding?.status === 'SUBMITTED').length

  return (
    <Screen
      title="Partners"
      subtitle={waiting ? `${waiting} waiting for review` : undefined}
      onRefresh={result.refetch}
      refreshing={result.isFetching && !result.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Business, city or owner" />
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={result.isLoading} error={result.error} onRetry={result.refetch} />
      {businesses.map((b) => (
        <BusinessCard key={b._id} business={b} live={live.has(b._id)} />
      ))}
      {result.data && !businesses.length ? (
        <EmptyState
          icon={{ sf: 'storefront.fill', md: 'storefront' }}
          title={filter === 'Submitted' && !q ? 'Nothing to review' : 'No matching partners'}
          message={filter === 'Submitted' && !q ? 'New business applications will show up here.' : undefined}
        />
      ) : null}
    </Screen>
  )
}
