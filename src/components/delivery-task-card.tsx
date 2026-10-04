import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spacing } from '@/constants/theme'
import type { DeliveryTask } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { formatPrice } from '@/utils/format'

const StatusTone = { Assigned: 'warning', 'Picked up': 'primary', Delivered: 'success' } as const

export function DeliveryTaskCard({ task, actions }: { task: DeliveryTask; actions?: ReactNode }) {
  const theme = useTheme()
  return (
    <Card>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.flex}>
          {task.id}
        </ThemedText>
        <Badge label={task.status} tone={StatusTone[task.status]} />
      </View>

      <View style={styles.route}>
        <View style={styles.rail}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <View style={[styles.dot, { backgroundColor: theme.success }]} />
        </View>
        <View style={styles.stops}>
          <View>
            <ThemedText type="caption" themeColor="textSecondary">
              PICKUP
            </ThemedText>
            <ThemedText type="small">{task.pickup}</ThemedText>
          </View>
          <View>
            <ThemedText type="caption" themeColor="textSecondary">
              DROP
            </ThemedText>
            <ThemedText type="small">{task.drop}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.header}>
        <ThemedText type="caption" themeColor="textSecondary" style={styles.flex}>
          {task.distance}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="success">
          {formatPrice(task.fee)}
        </ThemedText>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  route: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  rail: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: Spacing.one,
  },
  stops: {
    flex: 1,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
})
