import type { Href } from 'expo-router'

export const ROLES = [
  'customer',
  'store_owner',
  'restaurant_owner',
  'room_owner',
  'delivery',
  'admin',
  'super_admin',
] as const

export type Role = (typeof ROLES)[number]

export type MerchantRole = Extract<Role, 'store_owner' | 'restaurant_owner' | 'room_owner'>

export const RoleLabels: Record<Role, string> = {
  customer: 'Customer',
  store_owner: 'Store Owner',
  restaurant_owner: 'Restaurant Owner',
  room_owner: 'Room Owner',
  delivery: 'Delivery Partner',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export function isMerchantRole(role: Role | undefined): role is MerchantRole {
  return role === 'store_owner' || role === 'restaurant_owner' || role === 'room_owner'
}

/** Landing route for each role after sign-in. */
export const RoleHome: Record<Role, Href> = {
  customer: '/customer',
  store_owner: '/merchant',
  restaurant_owner: '/merchant',
  room_owner: '/merchant',
  delivery: '/delivery',
  admin: '/admin',
  super_admin: '/super-admin',
}
