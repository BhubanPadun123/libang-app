import { QueryStatus } from '@/components/catalog/query-status'
import { DeliveryCard } from '@/components/delivery/delivery-card'
import { ThemedText } from '@/components/themed-text'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { useGetDeliveriesQuery } from '@/store/delivery-api'
import { formatPrice } from '@/utils/format'

const DAY = 24 * 60 * 60 * 1000

/** Delivery counts and cash handled. Rider pay isn't tracked by the server yet. */
export default function DeliverySummaryScreen() {
  const deliveries = useGetDeliveriesQuery()
  const delivered = (deliveries.data ?? []).filter((o) => o.delivery.status === 'DELIVERED')

  const since = (ms: number) =>
    delivered.filter((o) => o.delivery.deliveredAt && Date.now() - new Date(o.delivery.deliveredAt).getTime() < ms)
  const today = delivered.filter(
    (o) => o.delivery.deliveredAt && new Date(o.delivery.deliveredAt).toDateString() === new Date().toDateString()
  )
  const week = since(7 * DAY)
  const cash = (list: typeof delivered) => formatPrice(list.reduce((sum, o) => sum + o.totalAmount, 0))

  return (
    <Screen title="Summary" onRefresh={deliveries.refetch} refreshing={deliveries.isFetching && !deliveries.isLoading}>
      <QueryStatus isLoading={deliveries.isLoading} error={deliveries.error} onRetry={deliveries.refetch} />
      {deliveries.data ? (
        <>
          <StatGrid
            stats={[
              { label: 'Delivered today', value: String(today.length), icon: { sf: 'checkmark.circle.fill', md: 'check_circle' }, tone: 'success' },
              { label: 'Cash collected today', value: cash(today), icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'primary' },
              { label: 'Last 7 days', value: String(week.length), icon: { sf: 'calendar', md: 'calendar_month' }, tone: 'info' },
              { label: 'Cash, last 7 days', value: cash(week), icon: { sf: 'tray.full.fill', md: 'savings' }, tone: 'neutral' },
            ]}
          />
          <ThemedText type="caption" themeColor="textSecondary">
            Hand collected cash over to your admin. Counts cover your latest 50 assignments.
          </ThemedText>

          <Section title="Recently delivered">
            {delivered.length ? (
              delivered.slice(0, 10).map((o) => <DeliveryCard key={o._id} order={o} />)
            ) : (
              <ThemedText themeColor="textSecondary">Deliveries you complete show up here.</ThemedText>
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  )
}
