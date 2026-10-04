import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { ChipGroup } from '@/components/ui/chip'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import type { IconName } from '@/components/ui/icon'
import { Partners } from '@/data/mock'

const Filters = ['All', 'Restaurant', 'Store', 'Rooms'] as const
const TypeIcon: Record<string, IconName> = {
  Restaurant: { sf: 'fork.knife', md: 'restaurant' },
  Store: { sf: 'storefront.fill', md: 'storefront' },
  Rooms: { sf: 'bed.double.fill', md: 'hotel' },
}
const StatusTone = { Active: 'success', Pending: 'warning', Suspended: 'danger' } as const

export default function AdminPartnersScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('All')
  const partners = Partners.filter((p) => filter === 'All' || p.type === filter)

  return (
    <Screen title="Partners" subtitle={`${Partners.length} registered`}>
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <ListCard>
        {partners.map((p) => (
          <ListItem
            key={p.id}
            title={p.name}
            subtitle={p.type}
            icon={TypeIcon[p.type]}
            iconTone="neutral"
            trailing={<Badge label={p.status} tone={StatusTone[p.status]} />}
            onPress={() => {}}
          />
        ))}
      </ListCard>
    </Screen>
  )
}
