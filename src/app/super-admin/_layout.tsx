import RoleTabs from '@/components/navigation/role-tabs'
import { SuperAdminTabs } from '@/navigation/tabs'

export default function SuperAdminLayout() {
  return <RoleTabs basePath="super-admin" tabs={SuperAdminTabs} />
}
