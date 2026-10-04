import { router } from 'expo-router'
import { useState } from 'react'

import { ListingIcon } from '@/components/catalog/listing-image'
import { QueryStatus } from '@/components/catalog/query-status'
import { OrderCard } from '@/components/order-card'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { formatOrderDate, OrderStatusLabel } from '@/constants/order-status'
import { useGetOrdersQuery } from '@/store/customer-api'
import type { CustomerOrder } from '@/types/catalog'

const Filters = ['Active', 'Past'] as const

const isActive = (o: CustomerOrder) => o.status === 'PENDING' || o.status === 'CONFIRMED'

function describeItems(order: CustomerOrder) {
  const [first, ...rest] = order.items
  if (!first) return ''
  const label = first.quantity > 1 ? `${first.quantity}× ${first.name}` : first.name
  return rest.length ? `${label} +${rest.length} more` : label
}

export default function CustomerOrdersScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('Active')
  const orders = useGetOrdersQuery()
  const visible = (orders.data ?? []).filter((o) => (filter === 'Active' ? isActive(o) : !isActive(o)))

  return (
    <Screen title="Orders" onRefresh={orders.refetch} refreshing={orders.isFetching && !orders.isLoading}>
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={orders.isLoading} error={orders.error} onRetry={orders.refetch} />
      {visible.map((o) => (
        <OrderCard
          key={o._id}
          id={`#${o._id.slice(-6).toUpperCase()}`}
          title={o.items.length === 1 ? o.items[0].name : `${o.items.length} items`}
          items={describeItems(o)}
          total={o.totalAmount}
          // Once the rider has it, the customer cares that it's on the way.
          status={o.delivery?.status === 'PICKED_UP' && isActive(o) ? 'On the way' : OrderStatusLabel[o.status]}
          time={formatOrderDate(o.createdAt)}
          icon={ListingIcon[o.items[0]?.listingType ?? 'PRODUCT']}
        />
      ))}
      {orders.data && !visible.length ? (
        <EmptyState
          icon={{ sf: 'bag', md: 'shopping_bag' }}
          title={filter === 'Active' ? 'No active orders' : 'No past orders'}
          message={filter === 'Active' ? 'Orders you place will show up here.' : undefined}
          action={
            filter === 'Active' ? <Button label="Start shopping" onPress={() => router.navigate('/customer')} /> : undefined
          }
        />
      ) : null}
    </Screen>
  )
}
