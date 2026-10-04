import { StyleSheet, View } from 'react-native'

import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { formatOrderDate } from '@/constants/order-status'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { ownerStatus, useGetOwnerOrdersQuery, useGetOwnerStatsQuery } from '@/store/owner-api'
import { formatPrice } from '@/utils/format'

/** Sales at the owner's own prices. Payouts aren't tracked by the server yet, so there's no balance. */
export default function MerchantEarningsScreen() {
  const theme = useTheme()
  const stats = useGetOwnerStatsQuery()
  const orders = useGetOwnerOrdersQuery()
  const delivered = (orders.data ?? []).filter((o) => ownerStatus(o) === 'DELIVERED')

  const refresh = () => {
    stats.refetch()
    orders.refetch()
  }

  const s = stats.data
  return (
    <Screen title="Earnings" onRefresh={refresh} refreshing={(stats.isFetching || orders.isFetching) && !stats.isLoading}>
      <QueryStatus isLoading={stats.isLoading} error={stats.error} onRetry={stats.refetch} />
      {s ? (
        <>
          <View style={[styles.total, { backgroundColor: theme.primary }]}>
            <ThemedText type="small" style={styles.onPrimaryMuted}>
              Delivered sales
            </ThemedText>
            <ThemedText style={styles.amount}>{formatPrice(s.deliveredTotal)}</ThemedText>
            <ThemedText type="caption" style={styles.onPrimaryMuted}>
              At your prices, across {s.totalOrders} {s.totalOrders === 1 ? 'order' : 'orders'}
            </ThemedText>
          </View>

          <StatGrid
            stats={[
              {
                label: 'Accepted, not delivered',
                value: formatPrice(s.confirmedTotal),
                icon: { sf: 'clock.fill', md: 'schedule' },
                tone: 'warning',
              },
              {
                label: 'Last 7 days',
                value: formatPrice(s.weekSales),
                icon: { sf: 'chart.line.uptrend.xyaxis', md: 'trending_up' },
                tone: 'success',
              },
            ]}
          />
        </>
      ) : null}

      <Section title="Recent delivered">
        <QueryStatus isLoading={orders.isLoading} error={orders.error} onRetry={orders.refetch} />
        {delivered.length ? (
          <ListCard>
            {delivered.slice(0, 20).map((o) => (
              <ListItem
                key={o._id}
                title={`Order #${o._id.slice(-6).toUpperCase()}`}
                subtitle={formatOrderDate(o.createdAt)}
                icon={{ sf: 'arrow.down.left', md: 'south_west' }}
                iconTone="success"
                trailing={
                  <ThemedText type="smallBold" themeColor="success">
                    +{formatPrice(o.totalAmount)}
                  </ThemedText>
                }
              />
            ))}
          </ListCard>
        ) : orders.data ? (
          <ThemedText themeColor="textSecondary">Orders you mark delivered show up here.</ThemedText>
        ) : null}
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  total: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  onPrimaryMuted: {
    color: 'rgba(255,255,255,0.8)',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 800,
    letterSpacing: -1,
  },
})
