import RoleTabs from '@/components/navigation/role-tabs'
import { AdminTabs } from '@/navigation/tabs'

export default function AdminLayout() {
  return <RoleTabs basePath="admin" tabs={AdminTabs} />
}
