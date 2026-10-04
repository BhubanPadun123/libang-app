import { useState } from 'react'

import { AdminOrderCard } from '@/components/admin/admin-order-card'
import { QueryStatus } from '@/components/catalog/query-status'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { useClearOrderBadge } from '@/hooks/use-clear-order-badge'
import { useGetAllOrdersQuery } from '@/store/admin-api'
import type { ServerOrderStatus } from '@/types/catalog'

const Filters = {
  All: null,
  Pending: 'PENDING',
  Confirmed: 'CONFIRMED',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
} as const satisfies Record<string, ServerOrderStatus | null>
type Filter = keyof typeof Filters

export default function AdminOrdersScreen() {
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const orders = useGetAllOrdersQuery()
  useClearOrderBadge()

  const q = query.trim().toLowerCase()
  const status = Filters[filter]
  const visible = (orders.data ?? []).filter(
    (o) =>
      (!status || o.status === status) &&
      (!q ||
        o._id.toLowerCase().endsWith(q.replace('#', '')) ||
        (o.deliveryAddress?.name ?? o.user?.name ?? '').toLowerCase().includes(q) ||
        o.items.some((i) => (i.owner?.name ?? '').toLowerCase().includes(q)))
  )

  return (
    <Screen
      title="Orders"
      subtitle="Latest 50 orders"
      onRefresh={orders.refetch}
      refreshing={orders.isFetching && !orders.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Order ID, customer or seller" />
      <ChipGroup options={Object.keys(Filters) as Filter[]} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={orders.isLoading} error={orders.error} onRetry={orders.refetch} />
      {visible.map((order) => (
        <AdminOrderCard key={order._id} order={order} />
      ))}
      {orders.data && !visible.length ? (
        <EmptyState icon={{ sf: 'tray', md: 'inbox' }} title="No matching orders" />
      ) : null}
    </Screen>
  )
}
