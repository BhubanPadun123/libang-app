import type { Address, Charges, DeliveryAddress, OrderItem, ServerOrderStatus } from '@/types/catalog'

/** User.role as stored by the backend. */
export type ServerRole =
  | 'CUSTOMER'
  | 'STORE_OWNER'
  | 'RESTAURANT_OWNER'
  | 'ROOM_OWNER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'STUFT'

export type StatsRange = 'today' | '7d' | '30d' | '90d' | '365d' | 'all'

export type ActivityEntry = {
  kind: 'USER' | 'ORDER' | 'BUSINESS' | 'LISTING'
  title: string
  description: string
  at: string
}

/** GET /api/admin/stats. Counts are for the chosen range; active/pending are right now. */
export type AdminStats = {
  totalUsers: number
  roomBookings: number
  foodOrders: number
  storeOrders: number
  allOrders: number
  revenue: number
  activeOrders: number
  pendingReviews: number
  recentOrders: {
    id: string
    customer: string
    type: string
    amount: number
    status: ServerOrderStatus
    createdAt: string
  }[]
  activity: ActivityEntry[]
  /** Percent change against the previous equal-length period; null for "all time". */
  change: Record<'totalUsers' | 'roomBookings' | 'foodOrders' | 'storeOrders', number | null>
  /** e.g. "Last 7 days". */
  rangeLabel?: string
}

type PersonRef = { _id: string; name?: string; email?: string; phone?: string; role?: ServerRole }

/** An order as an admin sees it: every line, with buyer and sellers populated. */
export type AdminOrder = {
  _id: string
  user?: PersonRef
  items: (Omit<OrderItem, 'owner'> & { owner?: PersonRef })[]
  charges?: Charges
  totalAmount: number
  deliveryAddress?: DeliveryAddress
  status: ServerOrderStatus
  createdAt: string
}

export type AdminUser = {
  _id: string
  name: string
  email: string
  phone?: string
  role: ServerRole
  isActive?: boolean
  createdAt?: string
}

export type BusinessStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export type Business = {
  _id: string
  ownerUserId?: string
  businessType: 'ROOM' | 'RESTAURANT' | 'STORE'
  business: { name: string; description?: string; address?: Address }
  owner?: { name?: string; phone?: string; email?: string; whatsapp?: string }
  onboarding: { status: BusinessStatus; rejectionReason?: string; submittedAt?: string }
  createdAt?: string
}

export type PlatformSettings = {
  platformFeeMode: 'FLAT' | 'PERCENT'
  platformFeeValue: number
  deliveryFee: number
  /** 0 turns free delivery off. */
  freeDeliveryAbove: number
}
