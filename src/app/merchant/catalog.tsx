import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { SearchField } from '@/components/ui/search-field'
import { Toggle } from '@/components/ui/toggle'
import { CatalogItems } from '@/data/mock'
import { getMerchantTabs } from '@/navigation/tabs'
import { isMerchantRole } from '@/constants/roles'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/utils/format'

export default function MerchantCatalogScreen() {
  const role = useAppSelector((s) => s.auth.user?.role)
  const catalogTab = isMerchantRole(role) ? getMerchantTabs(role).find((t) => t.name === 'catalog') : undefined
  const [items, setItems] = useState(CatalogItems)
  const [query, setQuery] = useState('')

  const visible = items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()))
  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i)))

  return (
    <Screen
      title={catalogTab?.label ?? 'Catalog'}
      subtitle={`${items.filter((i) => i.available).length} of ${items.length} available`}
      headerRight={<Button label="Add" size="sm" icon={{ sf: 'plus', md: 'add' }} />}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search items" />
      <ListCard>
        {visible.map((item) => (
          <ListItem
            key={item.id}
            title={item.name}
            subtitle={`${item.detail} · ${formatPrice(item.price)}`}
            icon={catalogTab ? { sf: catalogTab.sf, md: catalogTab.md } : undefined}
            iconTone={item.available ? 'primary' : 'neutral'}
            trailing={<Toggle value={item.available} onValueChange={() => toggle(item.id)} />}
          />
        ))}
      </ListCard>
    </Screen>
  )
}
