import type { AndroidSymbol } from 'expo-symbols'
import type { SFSymbol } from 'sf-symbols-typescript'
import type { MerchantRole } from '@/constants/roles'

export type RoleTab = {
  /** Route file name inside the role's folder, e.g. `index` or `orders`. */
  name: string
  label: string
  sf: SFSymbol
  md: AndroidSymbol
}

// Android's native tab bar shows at most 5 tabs — keep each list at 5 or fewer.

export const CustomerTabs: RoleTab[] = [
  { name: 'index', label: 'Home', sf: 'house.fill', md: 'home' },
  { name: 'search', label: 'Search', sf: 'magnifyingglass', md: 'search' },
  { name: 'orders', label: 'Orders', sf: 'bag.fill', md: 'receipt_long' },
  { name: 'cart', label: 'Cart', sf: 'cart.fill', md: 'shopping_cart' },
  { name: 'account', label: 'Account', sf: 'person.crop.circle.fill', md: 'person' },
]

const merchantCatalog: Record<MerchantRole, Pick<RoleTab, 'label' | 'sf' | 'md'>> = {
  store_owner: { label: 'Products', sf: 'shippingbox.fill', md: 'inventory_2' },
  restaurant_owner: { label: 'Menu', sf: 'fork.knife', md: 'restaurant_menu' },
  room_owner: { label: 'Rooms', sf: 'bed.double.fill', md: 'bed' },
}

export function getMerchantTabs(role: MerchantRole): RoleTab[] {
  return [
    { name: 'index', label: 'Dashboard', sf: 'chart.bar.fill', md: 'dashboard' },
    {
      name: 'orders',
      label: role === 'room_owner' ? 'Bookings' : 'Orders',
      sf: 'list.bullet.rectangle.fill',
      md: 'list_alt',
    },
    { name: 'catalog', ...merchantCatalog[role] },
    { name: 'earnings', label: 'Earnings', sf: 'banknote.fill', md: 'payments' },
    { name: 'account', label: 'Account', sf: 'person.crop.circle.fill', md: 'person' },
  ]
}

export const DeliveryTabs: RoleTab[] = [
  { name: 'index', label: 'Home', sf: 'bicycle', md: 'two_wheeler' },
  { name: 'tasks', label: 'Deliveries', sf: 'map.fill', md: 'local_shipping' },
  { name: 'earnings', label: 'Earnings', sf: 'banknote.fill', md: 'payments' },
  { name: 'account', label: 'Account', sf: 'person.crop.circle.fill', md: 'person' },
]

export const AdminTabs: RoleTab[] = [
  { name: 'index', label: 'Dashboard', sf: 'chart.bar.fill', md: 'dashboard' },
  { name: 'orders', label: 'Orders', sf: 'list.bullet.rectangle.fill', md: 'list_alt' },
  { name: 'partners', label: 'Partners', sf: 'storefront.fill', md: 'storefront' },
  { name: 'users', label: 'Users', sf: 'person.3.fill', md: 'group' },
  { name: 'account', label: 'Account', sf: 'person.crop.circle.fill', md: 'person' },
]

export const SuperAdminTabs: RoleTab[] = [
  { name: 'index', label: 'Dashboard', sf: 'chart.bar.fill', md: 'dashboard' },
  { name: 'admins', label: 'Admins', sf: 'person.badge.shield.checkmark.fill', md: 'admin_panel_settings' },
  { name: 'reports', label: 'Reports', sf: 'doc.text.fill', md: 'analytics' },
  { name: 'settings', label: 'Settings', sf: 'gearshape.fill', md: 'settings' },
  { name: 'account', label: 'Account', sf: 'person.crop.circle.fill', md: 'person' },
]
