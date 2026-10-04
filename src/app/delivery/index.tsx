import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { DeliveryTaskCard } from '@/components/delivery-task-card'
import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid } from '@/components/ui/stat-card'
import { Toggle } from '@/components/ui/toggle'
import { Radius, Spacing } from '@/constants/theme'
import { DeliveryTasks } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/utils/format'

export default function DeliveryHomeScreen() {
  const theme = useTheme()
  const name = useAppSelector((s) => s.auth.user?.name ?? '')
  const [online, setOnline] = useState(true)
  const request = DeliveryTasks.find((t) => t.status === 'Assigned')

  return (
    <Screen subtitle="Delivery partner" title="Home" headerRight={<Avatar name={name} />}>
      <View
        style={[
          styles.online,
          { backgroundColor: online ? theme.success : theme.backgroundSelected },
        ]}>
        <View style={styles.flex}>
          <ThemedText style={[styles.onlineTitle, online && styles.white]}>
            {online ? "You're online" : "You're offline"}
          </ThemedText>
          <ThemedText type="caption" style={online ? styles.whiteMuted : undefined} themeColor="textSecondary">
            {online ? 'Looking for nearby orders' : 'Go online to receive orders'}
          </ThemedText>
        </View>
        <Toggle
          value={online}
          onValueChange={setOnline}
          trackColor={{ false: theme.border, true: 'rgba(255,255,255,0.35)' }}
        />
      </View>

      <StatGrid
        stats={[
          { label: "Today's earnings", value: formatPrice(860), change: '+₹140', icon: { sf: 'banknote.fill', md: 'payments' }, tone: 'success' },
          { label: 'Deliveries', value: '12', icon: { sf: 'shippingbox.fill', md: 'package_2' }, tone: 'primary' },
          { label: 'Online time', value: '5h 20m', icon: { sf: 'clock.fill', md: 'schedule' }, tone: 'info' },
          { label: 'Rating', value: '4.9', icon: { sf: 'star.fill', md: 'star' }, tone: 'warning' },
        ]}
      />

      <Section title="New request">
        {online && request ? (
          <DeliveryTaskCard
            task={request}
            actions={
              <>
                <Button label="Accept" size="sm" icon={{ sf: 'checkmark', md: 'check' }} />
                <Button label="Decline" size="sm" variant="secondary" />
              </>
            }
          />
        ) : (
          <EmptyState
            icon={{ sf: 'bicycle', md: 'two_wheeler' }}
            title={online ? 'No requests right now' : 'You are offline'}
            message={online ? 'Stay online — new orders will appear here.' : undefined}
          />
        )}
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  online: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.xl,
  },
  flex: {
    flex: 1,
  },
  onlineTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 800,
  },
  white: {
    color: '#FFFFFF',
  },
  whiteMuted: {
    color: 'rgba(255,255,255,0.85)',
  },
})
