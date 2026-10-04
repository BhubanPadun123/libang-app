import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { OrderCard } from '@/components/order-card'
import { Section } from '@/components/ui/section'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ordersSeen } from '@/store/slices/notifications-slice'

function formatTime(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Orders pushed over the socket this session, newest first. Being on screen clears the
 * unread badge, including for orders that arrive while it's open.
 */
export function LiveOrdersSection({ title = 'Live orders' }: { title?: string }) {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((s) => s.notifications.liveOrders)
  const unread = useAppSelector((s) => s.notifications.unreadCount)

  useFocusEffect(
    useCallback(() => {
      if (unread > 0) dispatch(ordersSeen())
    }, [unread, dispatch])
  )

  if (!orders.length) return null

  return (
    <Section title={title}>
      {orders.map((o) => (
        <OrderCard
          key={o.id}
          id={o.orderNumber}
          title={`${o.customerName} → ${o.vendorName}`}
          items={o.itemsSummary}
          total={o.total}
          status="Pending"
          time={formatTime(o.createdAt)}
          icon={{ sf: 'bell.badge.fill', md: 'notifications_active' }}
        />
      ))}
    </Section>
  )
}
