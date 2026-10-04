/** Shapes returned by the Next.js customer APIs (/api/listings, /api/sellers, /api/cart, /api/orders). */

export type ListingType = 'ROOM' | 'FOOD' | 'PRODUCT'

/** Seller lists exist for food (restaurants) and products (stores); rooms are listed directly. */
export type SellerType = Extract<ListingType, 'FOOD' | 'PRODUCT'>

export type Address = {
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export type Listing = {
  _id: string
  owner: string
  name: string
  description?: string
  /** What the customer pays, markup included. */
  price: number
  mrp?: number
  isVeg?: boolean
  unit?: string
  category?: string
  stock?: number
  location?: Address
  amenities?: string[]
  images: string[]
  isAvailable: boolean
}

export type Seller = {
  /** The owner's user id; items reference sellers by owner. */
  _id: string
  name: string
  description?: string
  address?: Address
  images: string[]
  itemCount: number
  isLive: boolean
}

export type CartItem = {
  listingType: ListingType
  listingId: string
  owner: string
  name: string
  image?: string
  price: number
  itemPlatformFee: number
  itemDeliveryFee: number
  quantity: number
  subtotal: number
  lineTotal: number
  /** False when the listing was removed or taken offline after being added. */
  available: boolean
}

export type Charges = {
  itemsTotal: number
  platformFee: number
  deliveryFee: number
  totalAmount: number
}

export type Cart = {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  charges: Charges
}

export type DeliveryAddress = {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

export type ServerOrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

export type OrderItem = {
  listingType: ListingType
  listingId: string
  owner: string
  status: ServerOrderStatus
  name: string
  image?: string
  price: number
  quantity: number
  subtotal: number
  lineTotal: number
}

export type CustomerOrder = {
  _id: string
  items: OrderItem[]
  charges: Charges
  totalAmount: number
  deliveryAddress: DeliveryAddress
  paymentMethod: 'COD'
  status: ServerOrderStatus
  createdAt: string
}
