import type { Tone } from '@/components/ui/icon-bubble'
import type { ServerRole } from '@/types/admin'

export const ServerRoleLabel: Record<ServerRole, string> = {
  CUSTOMER: 'Customer',
  STORE_OWNER: 'Store owner',
  RESTAURANT_OWNER: 'Restaurant owner',
  ROOM_OWNER: 'Room owner',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
  STUFT: 'Staff',
  DELIVERY_PARTNER: 'Delivery partner',
}

export const ServerRoleTone: Record<ServerRole, Tone> = {
  CUSTOMER: 'neutral',
  STORE_OWNER: 'info',
  RESTAURANT_OWNER: 'primary',
  ROOM_OWNER: 'warning',
  ADMIN: 'success',
  SUPER_ADMIN: 'danger',
  STUFT: 'neutral',
  DELIVERY_PARTNER: 'success',
}

/** Roles a super admin can assign from the app. */
export const AssignableRoles: ServerRole[] = [
  'CUSTOMER',
  'STORE_OWNER',
  'RESTAURANT_OWNER',
  'ROOM_OWNER',
  'DELIVERY_PARTNER',
  'ADMIN',
  'SUPER_ADMIN',
]
