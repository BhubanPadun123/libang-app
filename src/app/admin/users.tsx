import { useState } from 'react'

import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChipGroup } from '@/components/ui/chip'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { PlatformUsers } from '@/data/mock'

const Filters = ['All', 'Customer', 'Delivery'] as const

export default function AdminUsersScreen() {
  const [filter, setFilter] = useState<(typeof Filters)[number]>('All')
  const [query, setQuery] = useState('')
  const users = PlatformUsers.filter(
    (u) =>
      (filter === 'All' || u.type === filter) &&
      u.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <Screen title="Users">
      <SearchField value={query} onChangeText={setQuery} placeholder="Search users" />
      <ChipGroup options={Filters} value={filter} onChange={setFilter} />
      <ListCard>
        {users.map((u) => (
          <ListItem
            key={u.id}
            title={u.name}
            subtitle={u.detail}
            leading={<Avatar name={u.name} size={40} />}
            trailing={<Badge label={u.type} tone={u.type === 'Delivery' ? 'info' : 'neutral'} />}
            onPress={() => {}}
          />
        ))}
      </ListCard>
    </Screen>
  )
}
