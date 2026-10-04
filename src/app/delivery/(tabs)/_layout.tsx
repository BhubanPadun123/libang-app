import RoleTabs from '@/components/navigation/role-tabs'
import { DeliveryTabs } from '@/navigation/tabs'

export default function DeliveryTabsLayout() {
  return <RoleTabs basePath="delivery" tabs={DeliveryTabs} />
}
