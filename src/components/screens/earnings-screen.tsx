import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { StatGrid, type Stat } from '@/components/ui/stat-card'
import { Radius, Spacing } from '@/constants/theme'
import { Transactions } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { formatPrice } from '@/utils/format'

type EarningsScreenProps = {
  balance: number
  stats: Stat[]
}

/** Shared earnings tab for merchants and delivery partners. */
export function EarningsScreen({ balance, stats }: EarningsScreenProps) {
  const theme = useTheme()

  return (
    <Screen title="Earnings">
      <View style={[styles.balance, { backgroundColor: theme.primary }]}>
        <ThemedText type="small" style={styles.onPrimaryMuted}>
          Available balance
        </ThemedText>
        <ThemedText style={styles.amount}>{formatPrice(balance)}</ThemedText>
        <ThemedText type="caption" style={styles.onPrimaryMuted}>
          Next payout on Monday
        </ThemedText>
        <View style={styles.balanceAction}>
          <Button label="Withdraw" variant="secondary" size="sm" onPress={() => {}} />
        </View>
      </View>

      <StatGrid stats={stats} />

      <Section title="Recent transactions" actionLabel="See all">
        <ListCard>
          {Transactions.map((t) => (
            <ListItem
              key={t.id}
              title={t.title}
              subtitle={t.date}
              icon={t.amount < 0 ? { sf: 'arrow.up.right', md: 'north_east' } : { sf: 'arrow.down.left', md: 'south_west' }}
              iconTone={t.amount < 0 ? 'neutral' : 'success'}
              trailing={
                <ThemedText type="smallBold" themeColor={t.amount < 0 ? 'text' : 'success'}>
                  {t.amount < 0 ? '−' : '+'}
                  {formatPrice(Math.abs(t.amount))}
                </ThemedText>
              }
            />
          ))}
        </ListCard>
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  balance: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  onPrimaryMuted: {
    color: 'rgba(255,255,255,0.8)',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 800,
    letterSpacing: -1,
  },
  balanceAction: {
    marginTop: Spacing.two,
  },
})
