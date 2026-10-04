import type { MerchantRole } from '@/constants/roles'
import type { ListingType } from '@/types/catalog'

type MerchantCopy = {
  listingType: ListingType
  /** "Orders" or "Bookings". */
  orders: string
  order: string
  /** Singular noun for one listing: dish, product or room. */
  item: string
}

/** Wording and listing type for each kind of business. */
export const Merchant: Record<MerchantRole, MerchantCopy> = {
  restaurant_owner: { listingType: 'FOOD', orders: 'Orders', order: 'order', item: 'dish' },
  store_owner: { listingType: 'PRODUCT', orders: 'Orders', order: 'order', item: 'product' },
  room_owner: { listingType: 'ROOM', orders: 'Bookings', order: 'booking', item: 'room' },
}
