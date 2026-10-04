import { useState } from 'react'

import { formatChange } from '@/components/admin/admin-dashboard'
import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import type { IconName } from '@/components/ui/icon'
import type { Tone } from '@/components/ui/icon-bubble'
import { ChipGroup } from '@/components/ui/chip'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { formatOrderDate } from '@/constants/order-status'
import { useGetAdminStatsQuery } from '@/store/admin-api'
import type { ActivityEntry, StatsRange } from '@/types/admin'
import { formatPrice } from '@/utils/format'

const Ranges = {
  '7 days': '7d',
  '30 days': '30d',
  '90 days': '90d',
  '12 months': '365d',
  'All time': 'all',
} as const satisfies Record<string, StatsRange>
type RangeLabel = keyof typeof Ranges

const ActivityIcon: Record<ActivityEntry['kind'], { icon: IconName; tone: Tone }> = {
  USER: { icon: { sf: 'person.badge.plus', md: 'person_add' }, tone: 'info' },
  ORDER: { icon: { sf: 'bag.fill', md: 'shopping_bag' }, tone: 'primary' },
  BUSINESS: { icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'warning' },
  LISTING: { icon: { sf: 'plus.square.fill', md: 'add_box' }, tone: 'success' },
}

export default function SuperAdminReportsScreen() {
  const [range, setRange] = useState<RangeLabel>('30 days')
  const stats = useGetAdminStatsQuery(Ranges[range])
  const s = stats.data
  // Always present for super admins; null only for admins, who can't open this tab.
  const revenue = s?.revenue ?? 0

  return (
    <Screen
      title="Reports"
      subtitle={s?.rangeLabel ? `${s.rangeLabel}${range !== 'All time' ? ' · vs previous period' : ''}` : undefined}
      onRefresh={stats.refetch}
      refreshing={stats.isFetching && !stats.isLoading}>
      <ChipGroup options={Object.keys(Ranges) as RangeLabel[]} value={range} onChange={setRange} />
      <QueryStatus isLoading={stats.isLoading} error={stats.error} onRetry={stats.refetch} />

      {s ? (
        <>
          <StatGrid
            stats={[
              { label: 'Revenue', value: formatPrice(revenue), icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
              { label: 'Orders', value: String(s.allOrders), icon: { sf: 'bag.fill', md: 'shopping_bag' }, tone: 'primary' },
              {
                label: 'New users',
                value: String(s.totalUsers),
                change: formatChange(s.change.totalUsers),
                icon: { sf: 'person.3.fill', md: 'group' },
                tone: 'info',
              },
              {
                label: 'Avg. order value',
                value: s.allOrders ? formatPrice(Math.round(revenue / s.allOrders)) : '—',
                icon: { sf: 'chart.bar.fill', md: 'bar_chart' },
                tone: 'neutral',
              },
            ]}
          />

          <Section title="By category">
            <StatGrid
              stats={[
                {
                  label: 'Food orders',
                  value: String(s.foodOrders),
                  change: formatChange(s.change.foodOrders),
                  icon: { sf: 'fork.knife', md: 'restaurant' },
                  tone: 'primary',
                },
                {
                  label: 'Store orders',
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
            <ThemedText type="caption" themeColor="textSecondary">
              An order with items of several types counts in each. Revenue excludes cancelled orders.
            </ThemedText>
          </Section>

          <Section title="Recent activity">
            {s.activity.length ? (
              <ListCard>
                {s.activity.map((a, i) => (
                  <ListItem
                    key={`${a.kind}-${a.at}-${i}`}
                    title={a.title}
                    subtitle={`${a.description} · ${formatOrderDate(a.at)}`}
                    icon={ActivityIcon[a.kind].icon}
                    iconTone={ActivityIcon[a.kind].tone}
                  />
                ))}
              </ListCard>
            ) : (
              <ThemedText themeColor="textSecondary">Nothing yet.</ThemedText>
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  )
}
