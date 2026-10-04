import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { IconName } from '@/components/ui/icon'
import { IconBubble } from '@/components/ui/icon-bubble'
import { Spacing } from '@/constants/theme'
import { OrderStatusTone, type OrderStatus } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { formatPrice } from '@/utils/format'

type OrderCardProps = {
  id: string
  title: string
  items: string
  total: number
  status: OrderStatus
  time: string
  icon: IconName
  /** Extra line under the items, e.g. the delivery address. */
  details?: string
  /** Action buttons rendered in the card footer. */
  actions?: ReactNode
  /** Free-form content under the actions, e.g. contacts or an assignment picker. */
  footer?: ReactNode
}

export function OrderCard({ id, title, items, total, status, time, icon, details, actions, footer }: OrderCardProps) {
  const theme = useTheme()
  return (
    <Card>
      <View style={styles.header}>
        <IconBubble icon={icon} />
        <View style={styles.headerText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {id} · {time}
          </ThemedText>
        </View>
        <Badge label={status} tone={OrderStatusTone[status]} />
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.items} numberOfLines={1}>
          {items}
        </ThemedText>
        <ThemedText type="smallBold">{formatPrice(total)}</ThemedText>
      </View>
      {details ? (
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
          {details}
        </ThemedText>
      ) : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
      {footer ? <View style={styles.footerSlot}>{footer}</View> : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  items: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  footerSlot: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
})
