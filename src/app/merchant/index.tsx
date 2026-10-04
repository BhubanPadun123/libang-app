import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { Toggle } from '@/components/ui/toggle'
import { RoleLabels } from '@/constants/roles'
import { Spacing } from '@/constants/theme'
import { MerchantOrders, OrderStatusTone } from '@/data/mock'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/utils/format'

export default function MerchantDashboardScreen() {
  const user = useAppSelector((s) => s.auth.user)
  const [isOpen, setIsOpen] = useState(true)
  const isRooms = user?.role === 'room_owner'

  return (
    <Screen
      subtitle={user ? RoleLabels[user.role] : undefined}
      title="Dashboard"
      headerRight={<Avatar name={user?.name ?? ''} />}>
      <Card style={styles.status}>
        <View style={styles.statusText}>
          <ThemedText type="smallBold">
            {isRooms ? 'Accepting bookings' : 'Store is open'}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {isOpen ? 'Customers can see and order from you' : 'You are hidden from customers'}
          </ThemedText>
        </View>
        <Toggle value={isOpen} onValueChange={setIsOpen} />
      </Card>

      <StatGrid
        stats={[
          { label: "Today's sales", value: formatPrice(12480), change: '+12%', icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
          { label: isRooms ? 'Bookings' : 'Orders', value: '38', change: '+5', icon: { sf: 'bag.fill', md: 'shopping_bag' }, tone: 'primary' },
          { label: 'Pending', value: '2', icon: { sf: 'clock.fill', md: 'schedule' }, tone: 'warning' },
          { label: 'Rating', value: '4.6', change: '+0.1', icon: { sf: 'star.fill', md: 'star' }, tone: 'info' },
        ]}
      />

      <Section title={isRooms ? 'Recent bookings' : 'Recent orders'} actionLabel="See all">
        <ListCard>
          {MerchantOrders.map((o) => (
            <ListItem
              key={o.id}
              title={`${o.id} · ${o.customer}`}
              subtitle={`${o.items} · ${o.time}`}
              trailing={<Badge label={o.status} tone={OrderStatusTone[o.status]} />}
            />
          ))}
        </ListCard>
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statusText: {
    flex: 1,
  },
})
