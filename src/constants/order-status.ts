import type { OrderStatus } from '@/data/mock'
import type { ServerOrderStatus } from '@/types/catalog'

/** Display label (and badge tone, via OrderStatusTone) for each server order status. */
export const OrderStatusLabel: Record<ServerOrderStatus, OrderStatus> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

/** "Today, 2:05 PM" for today, otherwise "4 Oct 2026". */
export function formatOrderDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}
