import RoleTabs from '@/components/navigation/role-tabs'
import { CustomerTabs } from '@/navigation/tabs'

export default function CustomerLayout() {
  return <RoleTabs basePath="customer" tabs={CustomerTabs} />
}
