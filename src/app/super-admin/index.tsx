import { Avatar } from '@/components/ui/avatar'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/utils/format'

export default function SuperAdminDashboardScreen() {
  const name = useAppSelector((s) => s.auth.user?.name ?? '')

  return (
    <Screen subtitle="Super admin" title="Overview" headerRight={<Avatar name={name} />}>
      <StatGrid
        stats={[
          { label: 'Revenue (MTD)', value: formatPrice(1240000), change: '+18%', icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
          { label: 'Active partners', value: '642', change: '+24', icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'primary' },
          { label: 'Customers', value: '38.2k', change: '+6%', icon: { sf: 'person.3.fill', md: 'group' }, tone: 'info' },
          { label: 'Delivery partners', value: '418', icon: { sf: 'bicycle', md: 'two_wheeler' }, tone: 'warning' },
        ]}
      />

      <Section title="Recent activity">
        <ListCard>
          <ListItem title="New admin added" subtitle="Meera Gupta · South zone · 2h ago" icon={{ sf: 'person.badge.plus', md: 'person_add' }} iconTone="info" />
          <ListItem title="Commission updated" subtitle="Restaurants 15% → 14% · yesterday" icon={{ sf: 'percent', md: 'percent' }} iconTone="warning" />
          <ListItem title="Partner suspended" subtitle="QuickMeds · policy violation · Sep 30" icon={{ sf: 'xmark.octagon.fill', md: 'block' }} iconTone="danger" />
        </ListCard>
      </Section>
    </Screen>
  )
}
