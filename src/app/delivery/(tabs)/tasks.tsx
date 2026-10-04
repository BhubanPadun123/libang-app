import { useState } from 'react'

import { QueryStatus } from '@/components/catalog/query-status'
import { DeliveryCard } from '@/components/delivery/delivery-card'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { useClearOrderBadge } from '@/hooks/use-clear-order-badge'
import { isActiveDelivery, useGetDeliveriesQuery } from '@/store/delivery-api'

const Filters = ['Active', 'Completed'] as const

export default function DeliveryTasksScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('Active')
  const deliveries = useGetDeliveriesQuery()
  useClearOrderBadge()

  const visible = (deliveries.data ?? []).filter((o) => (filter === 'Active') === isActiveDelivery(o))

  return (
    <Screen title="Deliveries" onRefresh={deliveries.refetch} refreshing={deliveries.isFetching && !deliveries.isLoading}>
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={deliveries.isLoading} error={deliveries.error} onRetry={deliveries.refetch} />
      {visible.map((order) => (
        <DeliveryCard key={order._id} order={order} />
      ))}
      {deliveries.data && !visible.length ? (
        <EmptyState
          icon={{ sf: 'shippingbox', md: 'package_2' }}
          title={filter === 'Active' ? 'No deliveries right now' : 'Nothing completed yet'}
          message={filter === 'Active' ? 'Orders an admin assigns to you show up here instantly.' : undefined}
        />
      ) : null}
    </Screen>
  )
}
