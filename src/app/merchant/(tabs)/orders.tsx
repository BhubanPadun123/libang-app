import { useState } from 'react'

import { QueryStatus } from '@/components/catalog/query-status'
import { OwnerOrderCard } from '@/components/owner/owner-order-card'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { Merchant } from '@/constants/merchant'
import { isMerchantRole } from '@/constants/roles'
import { useClearOrderBadge } from '@/hooks/use-clear-order-badge'
import { useAppSelector } from '@/store/hooks'
import { ownerStatus, useGetOwnerOrdersQuery } from '@/store/owner-api'
import type { ServerOrderStatus } from '@/types/catalog'

const Filters = ['New', 'Accepted', 'Completed'] as const
type Filter = (typeof Filters)[number]

const FilterStatus: Record<Filter, ServerOrderStatus[]> = {
  New: ['PENDING'],
  Accepted: ['CONFIRMED'],
  Completed: ['DELIVERED', 'CANCELLED'],
}

const EmptyMessage: Record<Filter, string> = {
  New: 'New orders show up here the moment a customer places them.',
  Accepted: 'Orders you accept stay here until delivered.',
  Completed: 'Delivered and cancelled orders show up here.',
}

export default function MerchantOrdersScreen() {
  const role = useAppSelector((s) => s.auth.user?.role)
  const copy = isMerchantRole(role) ? Merchant[role] : Merchant.store_owner
  const [filter, setFilter] = useState<Filter>('New')
  const orders = useGetOwnerOrdersQuery()
  useClearOrderBadge()

  const visible = (orders.data ?? []).filter((o) => FilterStatus[filter].includes(ownerStatus(o)))

  return (
    <Screen title={copy.orders} onRefresh={orders.refetch} refreshing={orders.isFetching && !orders.isLoading}>
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={orders.isLoading} error={orders.error} onRetry={orders.refetch} />
      {visible.map((order) => (
        <OwnerOrderCard key={order._id} order={order} />
      ))}
      {orders.data && !visible.length ? (
        <EmptyState
          icon={{ sf: 'tray', md: 'inbox' }}
          title={`No ${filter.toLowerCase()} ${copy.orders.toLowerCase()}`}
          message={EmptyMessage[filter]}
        />
      ) : null}
    </Screen>
  )
}
