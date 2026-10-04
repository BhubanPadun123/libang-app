import { router, type Href } from 'expo-router'
import { useState } from 'react'

import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChipGroup } from '@/components/ui/chip'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { formatOrderDate, OrderStatusLabel } from '@/constants/order-status'
import { useClearOrderBadge } from '@/hooks/use-clear-order-badge'
import { OrderStatusTone } from '@/data/mock'
import { useGetAdminStatsQuery } from '@/store/admin-api'
import { useAppSelector } from '@/store/hooks'
import type { StatsRange } from '@/types/admin'
import { formatPrice } from '@/utils/format'

const Ranges = { Today: 'today', '7 days': '7d', '30 days': '30d' } as const satisfies Record<string, StatsRange>
type RangeLabel = keyof typeof Ranges

/** "+12%" / "-3%", or nothing when there's no previous period to compare with. */
export function formatChange(value: number | null | undefined) {
  if (value === null || value === undefined) return undefined
  return `${value > 0 ? '+' : ''}${value}%`
}

type AdminDashboardProps = {
  subtitle: string
  /** Where "Pending approvals" and "See all orders" lead for this role. */
  partnersHref?: Href
  ordersHref?: Href
  /** For roles without an Orders tab, the dashboard is where the unread badge lives. */
  clearsOrderBadge?: boolean
}

/** Platform overview shared by admins and super admins. */
export function AdminDashboard({ subtitle, partnersHref, ordersHref, clearsOrderBadge }: AdminDashboardProps) {
  const name = useAppSelector((s) => s.auth.user?.name ?? '')
  const [range, setRange] = useState<RangeLabel>('Today')
  const stats = useGetAdminStatsQuery(Ranges[range])
  const s = stats.data
  useClearOrderBadge(clearsOrderBadge)

  return (
    <Screen
      subtitle={subtitle}
      title="Dashboard"
      headerRight={<Avatar name={name} />}
      onRefresh={stats.refetch}
      refreshing={stats.isFetching && !stats.isLoading}>
      <ChipGroup options={Object.keys(Ranges) as RangeLabel[]} value={range} onChange={setRange} />
      <QueryStatus isLoading={stats.isLoading} error={stats.error} onRetry={stats.refetch} />

      {s ? (
        <>
          <StatGrid
            stats={[
              { label: 'Orders', value: String(s.allOrders), icon: { sf: 'bag.fill', md: 'shopping_bag' }, tone: 'primary' },
              { label: 'Revenue', value: formatPrice(s.revenue), icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
              {
                label: 'Active orders now',
                value: String(s.activeOrders),
                icon: { sf: 'clock.fill', md: 'schedule' },
                tone: s.activeOrders ? 'warning' : 'neutral',
              },
              {
                label: 'New users',
                value: String(s.totalUsers),
                change: formatChange(s.change.totalUsers),
                icon: { sf: 'person.3.fill', md: 'group' },
                tone: 'info',
              },
            ]}
          />

          <Section title="Orders by type">
            <StatGrid
              stats={[
                {
                  label: 'Food',
                  value: String(s.foodOrders),
                  change: formatChange(s.change.foodOrders),
                  icon: { sf: 'fork.knife', md: 'restaurant' },
                  tone: 'primary',
                },
                {
                  label: 'Store',
                  value: String(s.storeOrders),
                  change: formatChange(s.change.storeOrders),
                  icon: { sf: 'storefront.fill', md: 'storefront' },
                  tone: 'info',
                },
                {
                  label: 'Room bookings',
                  value: String(s.roomBookings),
                  change: formatChange(s.change.roomBookings),
                  icon: { sf: 'bed.double.fill', md: 'hotel' },
                  tone: 'warning',
                },
              ]}
            />
          </Section>

          {s.pendingReviews > 0 && partnersHref ? (
            <ListCard>
              <ListItem
                title={`${s.pendingReviews} ${s.pendingReviews === 1 ? 'business is' : 'businesses are'} waiting for approval`}
                subtitle="Review submitted partners"
                icon={{ sf: 'storefront.fill', md: 'storefront' }}
                iconTone="warning"
                onPress={() => router.navigate(partnersHref)}
              />
            </ListCard>
          ) : null}

          <Section
            title="Recent orders"
            actionLabel={ordersHref ? 'See all' : undefined}
            onAction={ordersHref ? () => router.navigate(ordersHref) : undefined}>
            {s.recentOrders.length ? (
              <ListCard>
                {s.recentOrders.map((o) => (
                  <ListItem
                    key={o.id}
                    title={`${o.id} · ${o.customer}`}
                    subtitle={`${o.type} · ${formatPrice(o.amount)} · ${formatOrderDate(o.createdAt)}`}
                    trailing={<Badge label={OrderStatusLabel[o.status]} tone={OrderStatusTone[OrderStatusLabel[o.status]]} />}
                  />
                ))}
              </ListCard>
            ) : (
              <ThemedText themeColor="textSecondary">No orders yet.</ThemedText>
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  )
}
