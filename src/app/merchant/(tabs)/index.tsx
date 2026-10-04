import { router } from 'expo-router'

import { QueryStatus } from '@/components/catalog/query-status'
import { OwnerOrderCard } from '@/components/owner/owner-order-card'
import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { Merchant } from '@/constants/merchant'
import { isMerchantRole, RoleLabels } from '@/constants/roles'
import { useAppSelector } from '@/store/hooks'
import { ownerStatus, useGetOwnerOrdersQuery, useGetOwnerStatsQuery } from '@/store/owner-api'
import { formatPrice } from '@/utils/format'

export default function MerchantDashboardScreen() {
  const user = useAppSelector((s) => s.auth.user)
  const copy = isMerchantRole(user?.role) ? Merchant[user.role] : Merchant.store_owner
  const stats = useGetOwnerStatsQuery()
  const orders = useGetOwnerOrdersQuery()

  // Orders waiting on this owner come first; the rest fill up to five.
  const all = orders.data ?? []
  const waiting = all.filter((o) => ownerStatus(o) === 'PENDING')
  const recent = [...waiting, ...all.filter((o) => ownerStatus(o) !== 'PENDING')].slice(0, 5)

  const refresh = () => {
    stats.refetch()
    orders.refetch()
  }

  const s = stats.data
  return (
    <Screen
      subtitle={user ? RoleLabels[user.role] : undefined}
      title="Dashboard"
      headerRight={<Avatar name={user?.name ?? ''} />}
      onRefresh={refresh}
      refreshing={(stats.isFetching || orders.isFetching) && !stats.isLoading}>
      <QueryStatus isLoading={stats.isLoading} error={stats.error} onRetry={stats.refetch} />
      {s ? (
        <StatGrid
          stats={[
            {
              label: "Today's sales",
              value: formatPrice(s.todaySales),
              icon: { sf: 'banknote.fill', md: 'payments' },
              tone: 'success',
            },
            {
              label: `${copy.orders} today`,
              value: String(s.todayOrders),
              icon: { sf: 'bag.fill', md: 'shopping_bag' },
              tone: 'primary',
            },
            {
              label: 'Waiting for you',
              value: String(s.pendingOrders),
              icon: { sf: 'clock.fill', md: 'schedule' },
              tone: s.pendingOrders ? 'warning' : 'neutral',
            },
            {
              label: 'Last 7 days',
              value: formatPrice(s.weekSales),
              icon: { sf: 'chart.line.uptrend.xyaxis', md: 'trending_up' },
              tone: 'info',
            },
          ]}
        />
      ) : null}

      <Section
        title={waiting.length ? `Needs your attention (${waiting.length})` : `Recent ${copy.orders.toLowerCase()}`}
        actionLabel="See all"
        onAction={() => router.navigate('/merchant/orders')}>
        <QueryStatus isLoading={orders.isLoading} error={orders.error} onRetry={orders.refetch} />
        {recent.map((order) => (
          <OwnerOrderCard key={order._id} order={order} />
        ))}
        {orders.data && !recent.length ? (
          <ThemedText themeColor="textSecondary">
            No {copy.orders.toLowerCase()} yet. They&apos;ll appear here as soon as customers {copy.order === 'booking' ? 'book' : 'order'}.
          </ThemedText>
        ) : null}
      </Section>
    </Screen>
  )
}
