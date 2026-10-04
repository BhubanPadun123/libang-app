import { router } from 'expo-router'

import { QueryStatus } from '@/components/catalog/query-status'
import { DeliveryCard } from '@/components/delivery/delivery-card'
import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { useAppSelector } from '@/store/hooks'
import { isActiveDelivery, useGetDeliveriesQuery } from '@/store/delivery-api'
import { formatPrice } from '@/utils/format'

const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString()

export default function DeliveryHomeScreen() {
  const name = useAppSelector((s) => s.auth.user?.name ?? '')
  const deliveries = useGetDeliveriesQuery()
  const all = deliveries.data ?? []

  const active = all.filter(isActiveDelivery)
  // Already carrying something? That comes first.
  const current = active.find((o) => o.delivery.status === 'PICKED_UP') ?? active[0]
  const deliveredToday = all.filter((o) => o.delivery.status === 'DELIVERED' && isToday(o.delivery.deliveredAt))

  return (
    <Screen
      subtitle="Delivery partner"
      title={`Hi, ${name.split(' ')[0] || 'there'}`}
      headerRight={<Avatar name={name} />}
      onRefresh={deliveries.refetch}
      refreshing={deliveries.isFetching && !deliveries.isLoading}>
      <QueryStatus isLoading={deliveries.isLoading} error={deliveries.error} onRetry={deliveries.refetch} />
      {deliveries.data ? (
        <StatGrid
          stats={[
            { label: 'To deliver', value: String(active.length), icon: { sf: 'shippingbox.fill', md: 'package_2' }, tone: active.length ? 'warning' : 'neutral' },
            { label: 'Delivered today', value: String(deliveredToday.length), icon: { sf: 'checkmark.circle.fill', md: 'check_circle' }, tone: 'success' },
            {
              label: 'Cash to collect',
              value: formatPrice(active.reduce((sum, o) => sum + o.totalAmount, 0)),
              icon: { sf: 'banknote.fill', md: 'payments' },
              tone: 'primary',
            },
            {
              label: 'Collected today',
              value: formatPrice(deliveredToday.reduce((sum, o) => sum + o.totalAmount, 0)),
              icon: { sf: 'tray.full.fill', md: 'savings' },
              tone: 'info',
            },
          ]}
        />
      ) : null}

      {deliveries.data ? (
        <Section
          title={current?.delivery.status === 'PICKED_UP' ? 'On the way' : 'Next up'}
          actionLabel={active.length > 1 ? `All ${active.length}` : undefined}
          onAction={() => router.navigate('/delivery/tasks')}>
          {current ? (
            <DeliveryCard order={current} />
          ) : (
            <ThemedText themeColor="textSecondary">
              Nothing assigned right now. You&apos;ll hear a chime when an admin gives you an order.
            </ThemedText>
          )}
        </Section>
      ) : null}
    </Screen>
  )
}
