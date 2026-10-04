import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type QuantityStepperProps = {
  value: number
  onChange: (delta: number) => void
  busy?: boolean
  /** Blocks the + button, e.g. at the server's limit of 99. */
  max?: number
}

export function QuantityStepper({ value, onChange, busy, max = 99 }: QuantityStepperProps) {
  const theme = useTheme()
  return (
    <View style={[styles.stepper, { backgroundColor: theme.primarySoft }]}>
      <Pressable hitSlop={8} disabled={busy} onPress={() => onChange(-1)} accessibilityLabel="Decrease quantity">
        <Icon sf="minus" md="remove" size={16} color={theme.primary} />
      </Pressable>
      <View style={styles.value}>
        {busy ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <ThemedText type="smallBold" themeColor="primary" style={styles.qty}>
            {value}
          </ThemedText>
        )}
      </View>
      <Pressable
        hitSlop={8}
        disabled={busy || value >= max}
        onPress={() => onChange(1)}
        accessibilityLabel="Increase quantity">
        <Icon sf="plus" md="add" size={16} color={theme.primary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  value: {
    minWidth: 20,
    alignItems: 'center',
  },
  qty: {
    textAlign: 'center',
  },
})
