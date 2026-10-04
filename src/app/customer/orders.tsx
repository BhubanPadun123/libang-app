import { useState } from 'react'

import { OrderCard } from '@/components/order-card'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { CustomerOrders } from '@/data/mock'

const Filters = ['Active', 'Past'] as const

export default function CustomerOrdersScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('Active')
  const orders = CustomerOrders.filter((o) =>
    filter === 'Active' ? o.status !== 'Delivered' && o.status !== 'Cancelled' : o.status === 'Delivered' || o.status === 'Cancelled'
  )

  return (
    <Screen title="Orders">
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
            actions={
              o.status === 'On the way' ? (
                <Button label="Track order" size="sm" icon={{ sf: 'location.fill', md: 'near_me' }} />
              ) : o.status === 'Delivered' ? (
                <Button label="Reorder" variant="secondary" size="sm" />
              ) : undefined
            }
          />
        ))
      ) : (
        <EmptyState icon={{ sf: 'bag', md: 'shopping_bag' }} title="No orders yet" />
      )}
    </Screen>
  )
}
