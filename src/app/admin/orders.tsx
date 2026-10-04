import { useState } from 'react'

import { LiveOrdersSection } from '@/components/live-orders-section'
import { OrderCard } from '@/components/order-card'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { CustomerOrders, type OrderStatus } from '@/data/mock'

const Filters = ['All', 'Pending', 'Preparing', 'On the way', 'Delivered', 'Cancelled'] as const

export default function AdminOrdersScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('All')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const orders = CustomerOrders.filter(
    (o) =>
      (filter === 'All' || o.status === (filter as OrderStatus)) &&
      (!q || o.id.toLowerCase().includes(q) || o.vendor.toLowerCase().includes(q))
  )

  return (
    <Screen title="Orders">
      <LiveOrdersSection />
      <SearchField value={query} onChangeText={setQuery} placeholder="Search by order ID or partner" />
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      {orders.length ? (
        orders.map((o) => (
          <OrderCard
            key={o.id}
            id={o.id}
            title={o.vendor}
            items={o.items}
            total={o.total}
            status={o.status}
            time={o.time}
            icon={o.icon}
          />
        ))
      ) : (
        <EmptyState icon={{ sf: 'tray', md: 'inbox' }} title="No matching orders" />
      )}
    </Screen>
  )
}
