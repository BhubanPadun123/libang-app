import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { formatPrice } from '@/utils/format'

export default function SuperAdminReportsScreen() {
  return (
    <Screen title="Reports">
      <StatGrid
        stats={[
          { label: 'Avg. order value', value: formatPrice(386), change: '+4%', icon: { sf: 'cart.fill', md: 'shopping_cart' }, tone: 'primary' },
          { label: 'Avg. delivery time', value: '27 min', change: '-2 min', icon: { sf: 'timer', md: 'timer' }, tone: 'info' },
        ]}
      />
      <Section title="Reports">
        <ListCard>
          <ListItem title="Revenue & commission" subtitle="Daily, weekly and monthly" icon={{ sf: 'chart.bar.fill', md: 'bar_chart' }} iconTone="success" onPress={() => {}} />
          <ListItem title="Orders & bookings" subtitle="Volume by category and zone" icon={{ sf: 'list.bullet.rectangle.fill', md: 'list_alt' }} iconTone="primary" onPress={() => {}} />
          <ListItem title="Partner performance" subtitle="Ratings, cancellations, prep time" icon={{ sf: 'storefront.fill', md: 'storefront' }} iconTone="info" onPress={() => {}} />
          <ListItem title="Delivery operations" subtitle="Rider utilisation and SLAs" icon={{ sf: 'bicycle', md: 'two_wheeler' }} iconTone="warning" onPress={() => {}} />
        </ListCard>
      </Section>
    </Screen>
  )
}
