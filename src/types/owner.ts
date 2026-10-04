import type { Address, DeliveryAddress, Listing, OrderItem, ServerOrderStatus } from '@/types/catalog'

/** An owner's own listing. Unlike the public view, `price` is their base price, before markup. */
export type OwnerListing = Listing & {
  businessId?: string
  createdAt?: string
}

/** Fields an owner may set; which ones apply depends on the listing type. */
export type ListingInput = {
  name: string
  description?: string
  price: number
  images?: string[]
  isAvailable?: boolean
  // Food and products
  category?: string
  // Food
  isVeg?: boolean
  // Products
  mrp?: number
  stock?: number
  unit?: string
  // Rooms
  location?: Address
  amenities?: string[]
}

/** An order as an owner sees it: only their own lines, at their own price, without platform fees. */
export type OwnerOrder = {
  _id: string
  user?: { _id: string; name?: string; email?: string; phone?: string }
  items: OrderItem[]
  totalAmount: number
  deliveryAddress?: DeliveryAddress
  /** Rolled up across every seller in the order; use the item statuses for this owner's part. */
  status: ServerOrderStatus
  createdAt: string
}

export type OwnerStats = {
  totalOrders: number
  pendingOrders: number
  todayOrders: number
  todaySales: number
  weekSales: number
  /** Sum of delivered lines. */
  deliveredTotal: number
  /** Accepted but not yet delivered. */
  confirmedTotal: number
}
