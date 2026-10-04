import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { CustomerOrders, OrderStatusTone, Partners } from '@/data/mock'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/utils/format'

export default function AdminDashboardScreen() {
  const name = useAppSelector((s) => s.auth.user?.name ?? '')
  const pending = Partners.filter((p) => p.status === 'Pending')

  return (
    <Screen subtitle="Admin" title="Dashboard" headerRight={<Avatar name={name} />}>
      <StatGrid
        stats={[
          { label: 'Orders today', value: '1,284', change: '+9%', icon: { sf: 'bag.fill', md: 'shopping_bag' }, tone: 'primary' },
          { label: 'GMV today', value: formatPrice(482300), change: '+14%', icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
          { label: 'Riders online', value: '86', icon: { sf: 'bicycle', md: 'two_wheeler' }, tone: 'info' },
          { label: 'Open issues', value: '7', change: '-3', icon: { sf: 'exclamationmark.triangle.fill', md: 'warning' }, tone: 'danger' },
        ]}
      />

      <Section title="Pending approvals" actionLabel="See all">
        <ListCard>
          {pending.map((p) => (
            <ListItem
              key={p.id}
              title={p.name}
              subtitle={p.type}
              icon={{ sf: 'storefront.fill', md: 'storefront' }}
              iconTone="warning"
              onPress={() => {}}
            />
          ))}
        </ListCard>
      </Section>

      <Section title="Live orders">
        <ListCard>
          {CustomerOrders.slice(0, 3).map((o) => (
            <ListItem
              key={o.id}
              title={`${o.id} · ${o.vendor}`}
              subtitle={o.time}
              icon={o.icon}
              iconTone="neutral"
              trailing={<Badge label={o.status} tone={OrderStatusTone[o.status]} />}
            />
          ))}
        </ListCard>
      </Section>
    </Screen>
  )
}
