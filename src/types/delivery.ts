import type { DeliveryAddress, DeliveryStatus, ListingType, ServerOrderStatus } from '@/types/catalog'

export type Pickup = {
  ownerId: string
  /** The seller's store or restaurant name. */
  name: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  items: { name: string; quantity: number }[]
}

/** An order assigned to the signed-in delivery partner (GET /api/delivery/orders). */
export type DeliveryOrder = {
  _id: string
  orderNumber: string
  status: ServerOrderStatus
  delivery: { status: DeliveryStatus; assignedAt?: string; pickedUpAt?: string; deliveredAt?: string }
  deliveryAddress: DeliveryAddress
  /** Cash to collect at the door. */
  totalAmount: number
  paymentMethod: 'COD'
  items: { name: string; quantity: number; listingType: ListingType }[]
  pickups: Pickup[]
  createdAt: string
}
