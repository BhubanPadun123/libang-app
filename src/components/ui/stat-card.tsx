import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Card } from '@/components/ui/card'
import type { IconName } from '@/components/ui/icon'
import { IconBubble, type Tone } from '@/components/ui/icon-bubble'
import { Spacing } from '@/constants/theme'

export type Stat = {
  label: string
  value: string
  /** e.g. "+12%" — positive values render green, negative red. */
  change?: string
  icon: IconName
  tone?: Tone
}

export function StatCard({ label, value, change, icon, tone }: Stat) {
  const isNegative = change?.startsWith('-')
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <IconBubble icon={icon} tone={tone} size={36} />
        {change ? (
          <ThemedText type="caption" themeColor={isNegative ? 'danger' : 'success'}>
            {change}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Card>
  )
}

/** Two-column grid of stat cards. */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.cell}>
          <StatCard {...stat} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
  },
  cell: {
    width: '50%',
    padding: Spacing.one,
  },
})
