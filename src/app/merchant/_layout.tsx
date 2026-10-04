import RoleTabs from '@/components/navigation/role-tabs'
import { isMerchantRole } from '@/constants/roles'
import { getMerchantTabs } from '@/navigation/tabs'
import { useAppSelector } from '@/store/hooks'

/** Shared by store, restaurant, and room owners; tab labels adapt to the business type. */
export default function MerchantLayout() {
  const role = useAppSelector((s) => s.auth.user?.role)
  if (!isMerchantRole(role)) return null
  return <RoleTabs basePath="merchant" tabs={getMerchantTabs(role)} />
}
