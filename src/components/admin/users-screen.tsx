import { useState } from 'react'

import { UserRow } from '@/components/admin/user-row'
import { QueryStatus } from '@/components/catalog/query-status'
import { ChipGroup } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import { ListCard } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useGetUsersQuery } from '@/store/admin-api'
import type { ServerRole } from '@/types/admin'

const Filters = {
  All: 'ALL',
  Customers: 'CUSTOMER',
  'Store owners': 'STORE_OWNER',
  'Restaurant owners': 'RESTAURANT_OWNER',
  'Room owners': 'ROOM_OWNER',
  Admins: 'ADMIN',
  'Super admins': 'SUPER_ADMIN',
} as const satisfies Record<string, ServerRole | 'ALL'>

export type UserFilter = keyof typeof Filters

type UsersScreenProps = {
  title: string
  initialFilter?: UserFilter
  /** Super admins can change roles and delete accounts. */
  manageable?: boolean
}

/** Searchable list of platform accounts. */
export function UsersScreen({ title, initialFilter = 'All', manageable }: UsersScreenProps) {
  const [filter, setFilter] = useState<UserFilter>(initialFilter)
  const [query, setQuery] = useState('')
  const search = useDebouncedValue(query.trim())
  const users = useGetUsersQuery({ search, role: Filters[filter] })
  const list = users.data ?? []

  return (
    <Screen
      title={title}
      subtitle={manageable ? 'Tap someone to change their role' : undefined}
      onRefresh={users.refetch}
      refreshing={users.isFetching && !users.isLoading}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search name, email or phone" />
      <ChipGroup options={Object.keys(Filters) as UserFilter[]} value={filter} onChange={setFilter} />
      <QueryStatus isLoading={users.isLoading} error={users.error} onRetry={users.refetch} />
      {list.length ? (
        <ListCard>
          {list.map((user) => (
            <UserRow key={user._id} user={user} manageable={manageable} />
          ))}
        </ListCard>
      ) : users.data ? (
        <EmptyState
          icon={{ sf: 'person.3.fill', md: 'group' }}
          title="No users found"
          message={search ? `Nothing matches "${search}".` : undefined}
        />
      ) : null}
    </Screen>
  )
}
