// Placeholder data so screens look real until the API is wired up.
import type { IconName } from '@/components/ui/icon'
import type { Tone } from '@/components/ui/icon-bubble'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled'

export const OrderStatusTone: Record<OrderStatus, Tone> = {
  Pending: 'warning',
  Confirmed: 'info',
  Preparing: 'info',
  'On the way': 'primary',
  Delivered: 'success',
  Cancelled: 'danger',
}

export type Order = {
  id: string
  vendor: string
  items: string
  total: number
  status: OrderStatus
  time: string
  icon: IconName
}

export const Categories: { label: string; icon: IconName; tone: Tone }[] = [
  { label: 'Food', icon: { sf: 'fork.knife', md: 'restaurant' }, tone: 'primary' },
  { label: 'Grocery', icon: { sf: 'basket.fill', md: 'local_grocery_store' }, tone: 'success' },
  { label: 'Stores', icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'info' },
  { label: 'Rooms', icon: { sf: 'bed.double.fill', md: 'hotel' }, tone: 'warning' },
  { label: 'Pharmacy', icon: { sf: 'cross.case.fill', md: 'local_pharmacy' }, tone: 'danger' },
  { label: 'Parcel', icon: { sf: 'shippingbox.fill', md: 'package_2' }, tone: 'neutral' },
]

export const NearbyPlaces: {
  id: string
  name: string
  type: string
  rating: number
  eta: string
  icon: IconName
  tone: Tone
}[] = [
  { id: 'p1', name: 'Spice Garden', type: 'Restaurant · Indian', rating: 4.6, eta: '25 min', icon: { sf: 'fork.knife', md: 'restaurant' }, tone: 'primary' },
  { id: 'p2', name: 'FreshMart', type: 'Grocery store', rating: 4.4, eta: '30 min', icon: { sf: 'basket.fill', md: 'local_grocery_store' }, tone: 'success' },
  { id: 'p3', name: 'Hill View Rooms', type: 'Stay · from ₹1,200/night', rating: 4.8, eta: '2 km', icon: { sf: 'bed.double.fill', md: 'hotel' }, tone: 'warning' },
  { id: 'p4', name: 'Momo House', type: 'Restaurant · Tibetan', rating: 4.7, eta: '20 min', icon: { sf: 'takeoutbag.and.cup.and.straw.fill', md: 'takeout_dining' }, tone: 'info' },
]

export const CustomerOrders: Order[] = [
  { id: '#LX1042', vendor: 'Spice Garden', items: 'Butter Chicken, 2× Naan', total: 540, status: 'On the way', time: 'Today, 1:20 PM', icon: { sf: 'fork.knife', md: 'restaurant' } },
  { id: '#LX1039', vendor: 'FreshMart', items: 'Milk, Eggs, Bread +4 more', total: 820, status: 'Preparing', time: 'Today, 12:05 PM', icon: { sf: 'basket.fill', md: 'local_grocery_store' } },
  { id: '#LX1021', vendor: 'Hill View Rooms', items: 'Deluxe room · 2 nights', total: 2400, status: 'Delivered', time: 'Sep 28', icon: { sf: 'bed.double.fill', md: 'hotel' } },
  { id: '#LX1007', vendor: 'Momo House', items: '2× Steam Momo', total: 260, status: 'Cancelled', time: 'Sep 24', icon: { sf: 'takeoutbag.and.cup.and.straw.fill', md: 'takeout_dining' } },
]

export type CartItem = { id: string; name: string; vendor: string; price: number; qty: number }

export const InitialCart: CartItem[] = [
  { id: 'c1', name: 'Paneer Tikka', vendor: 'Spice Garden', price: 280, qty: 1 },
  { id: 'c2', name: 'Garlic Naan', vendor: 'Spice Garden', price: 60, qty: 3 },
  { id: 'c3', name: 'Mango Lassi', vendor: 'Spice Garden', price: 90, qty: 2 },
]

export const MerchantOrders: (Order & { customer: string })[] = [
  { id: '#LX1045', customer: 'Anita R.', vendor: '', items: '2× Paneer Tikka, 1× Lassi', total: 650, status: 'Pending', time: '2 min ago', icon: { sf: 'bag.fill', md: 'shopping_bag' } },
  { id: '#LX1044', customer: 'Rahul S.', vendor: '', items: 'Veg Thali', total: 220, status: 'Pending', time: '6 min ago', icon: { sf: 'bag.fill', md: 'shopping_bag' } },
  { id: '#LX1041', customer: 'Karma T.', vendor: '', items: 'Butter Chicken, 2× Naan', total: 540, status: 'Preparing', time: '14 min ago', icon: { sf: 'bag.fill', md: 'shopping_bag' } },
  { id: '#LX1036', customer: 'Priya M.', vendor: '', items: 'Biryani family pack', total: 899, status: 'Delivered', time: '1 hr ago', icon: { sf: 'bag.fill', md: 'shopping_bag' } },
]

export const CatalogItems: { id: string; name: string; detail: string; price: number; available: boolean }[] = [
  { id: 'i1', name: 'Paneer Tikka', detail: 'Starters', price: 280, available: true },
  { id: 'i2', name: 'Butter Chicken', detail: 'Main course', price: 360, available: true },
  { id: 'i3', name: 'Veg Thali', detail: 'Combos', price: 220, available: false },
  { id: 'i4', name: 'Garlic Naan', detail: 'Breads', price: 60, available: true },
  { id: 'i5', name: 'Mango Lassi', detail: 'Beverages', price: 90, available: true },
]

export const Transactions: { id: string; title: string; date: string; amount: number }[] = [
  { id: 't1', title: 'Weekly payout', date: 'Oct 1', amount: -18450 },
  { id: 't2', title: 'Order #LX1036', date: 'Sep 30', amount: 899 },
  { id: 't3', title: 'Order #LX1033', date: 'Sep 30', amount: 420 },
  { id: 't4', title: 'Order #LX1029', date: 'Sep 29', amount: 1150 },
]

export type DeliveryTask = {
  id: string
  pickup: string
  drop: string
  distance: string
  fee: number
  status: 'Assigned' | 'Picked up' | 'Delivered'
}

export const DeliveryTasks: DeliveryTask[] = [
  { id: '#LX1042', pickup: 'Spice Garden, MG Road', drop: 'Sunrise Apartments, B-204', distance: '3.2 km', fee: 45, status: 'Picked up' },
  { id: '#LX1043', pickup: 'FreshMart, Station Road', drop: 'Green Villa, Lane 4', distance: '2.1 km', fee: 35, status: 'Assigned' },
  { id: '#LX1031', pickup: 'Momo House, Main Bazaar', drop: 'Hotel Pine Crest', distance: '4.8 km', fee: 60, status: 'Delivered' },
]

export const Partners: { id: string; name: string; type: string; status: 'Active' | 'Pending' | 'Suspended' }[] = [
  { id: 'v1', name: 'Spice Garden', type: 'Restaurant', status: 'Active' },
  { id: 'v2', name: 'Cozy Nest Homestay', type: 'Rooms', status: 'Pending' },
  { id: 'v3', name: 'FreshMart', type: 'Store', status: 'Active' },
  { id: 'v4', name: 'Urban Bites', type: 'Restaurant', status: 'Pending' },
  { id: 'v5', name: 'QuickMeds', type: 'Store', status: 'Suspended' },
]

export const PlatformUsers: { id: string; name: string; type: 'Customer' | 'Delivery'; detail: string }[] = [
  { id: 'u1', name: 'Anita Rai', type: 'Customer', detail: '24 orders · joined Jan 2026' },
  { id: 'u2', name: 'Tenzing Lama', type: 'Delivery', detail: '312 deliveries · ★ 4.9' },
  { id: 'u3', name: 'Rahul Sharma', type: 'Customer', detail: '8 orders · joined Aug 2026' },
  { id: 'u4', name: 'Pema Sherpa', type: 'Delivery', detail: '128 deliveries · ★ 4.7' },
]

export const AdminAccounts: { id: string; name: string; region: string; active: boolean }[] = [
  { id: 'a1', name: 'Sonam Dorji', region: 'North zone', active: true },
  { id: 'a2', name: 'Meera Gupta', region: 'South zone', active: true },
  { id: 'a3', name: 'Arjun Thapa', region: 'Operations', active: false },
]
