import type { IconName } from '@/components/ui/icon'
import type { Tone } from '@/components/ui/icon-bubble'
import type { Role } from '@/constants/roles'

export const RoleMeta: Record<Role, { description: string; icon: IconName; tone: Tone }> = {
  customer: { description: 'Order food, groceries and book rooms', icon: { sf: 'person.fill', md: 'person' }, tone: 'primary' },
  store_owner: { description: 'Sell products from your store', icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'info' },
  restaurant_owner: { description: 'Manage your menu and orders', icon: { sf: 'fork.knife', md: 'restaurant' }, tone: 'success' },
  room_owner: { description: 'List rooms and manage bookings', icon: { sf: 'bed.double.fill', md: 'hotel' }, tone: 'warning' },
  delivery: { description: 'Pick up and deliver orders', icon: { sf: 'bicycle', md: 'two_wheeler' }, tone: 'primary' },
  admin: { description: 'Operate partners, orders and users', icon: { sf: 'shield.fill', md: 'shield_person' }, tone: 'neutral' },
  super_admin: { description: 'Full platform control', icon: { sf: 'crown.fill', md: 'admin_panel_settings' }, tone: 'danger' },
}
