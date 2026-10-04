import { useState } from 'react'

import { LiveOrdersSection } from '@/components/live-orders-section'
import { OrderCard } from '@/components/order-card'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { MerchantOrders, type OrderStatus } from '@/data/mock'
import { useAppSelector } from '@/store/hooks'

const Filters = ['New', 'Preparing', 'Completed'] as const
const FilterStatus: Record<(typeof Filters)[number], OrderStatus[]> = {
  New: ['Pending'],
  Preparing: ['Preparing', 'On the way'],
  Completed: ['Delivered', 'Cancelled'],
}

export default function MerchantOrdersScreen() {
  const isRooms = useAppSelector((s) => s.auth.user?.role === 'room_owner')
  const [filter, setFilter] = useState<(typeof Filters)[number]>('New')
  const orders = MerchantOrders.filter((o) => FilterStatus[filter].includes(o.status))

  return (
    <Screen title={isRooms ? 'Bookings' : 'Orders'}>
      <LiveOrdersSection title={isRooms ? 'Live bookings' : 'Live orders'} />
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      {orders.length ? (
        orders.map((o) => (
          <OrderCard
            key={o.id}
            id={o.id}
            title={o.customer}
            items={o.items}
            total={o.total}
            status={o.status}
            time={o.time}
            icon={o.icon}
            actions={
              o.status === 'Pending' ? (
                <>
                  <Button label="Accept" size="sm" icon={{ sf: 'checkmark', md: 'check' }} />
                  <Button label="Reject" size="sm" variant="secondary" />
                </>
              ) : o.status === 'Preparing' ? (
                <Button label="Mark ready" size="sm" variant="secondary" />
              ) : undefined
            }
          />
        ))
      ) : (
        <EmptyState icon={{ sf: 'tray', md: 'inbox' }} title="Nothing here" message="New orders will show up here." />
      )}
    </Screen>
  )
}
