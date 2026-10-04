import { useState } from 'react'

import { DeliveryTaskCard } from '@/components/delivery-task-card'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { DeliveryTasks } from '@/data/mock'

const Filters = ['Active', 'Completed'] as const

export default function DeliveryTasksScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('Active')
  const tasks = DeliveryTasks.filter((t) => (filter === 'Active' ? t.status !== 'Delivered' : t.status === 'Delivered'))

  return (
    <Screen title="Deliveries">
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      {tasks.length ? (
        tasks.map((t) => (
          <DeliveryTaskCard
            key={t.id}
            task={t}
            actions={
              t.status === 'Picked up' ? (
                <>
                  <Button label="Navigate" size="sm" icon={{ sf: 'location.fill', md: 'navigation' }} />
                  <Button label="Mark delivered" size="sm" variant="secondary" />
                </>
              ) : t.status === 'Assigned' ? (
                <Button label="Confirm pickup" size="sm" />
              ) : undefined
            }
          />
        ))
      ) : (
        <EmptyState icon={{ sf: 'shippingbox', md: 'package_2' }} title="No deliveries" />
      )}
    </Screen>
  )
}
