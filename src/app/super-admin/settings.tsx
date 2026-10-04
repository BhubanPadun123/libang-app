import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChipGroup } from '@/components/ui/chip'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { TextField } from '@/components/ui/text-field'
import { Spacing } from '@/constants/theme'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/admin-api'
import { errorMessage } from '@/store/customer-api'
import type { PlatformSettings } from '@/types/admin'
import { formatPrice } from '@/utils/format'

/** Checkout fees charged to customers on every order. */
export default function SuperAdminSettingsScreen() {
  const settings = useGetSettingsQuery()

  return (
    <Screen title="Settings" onRefresh={settings.refetch} refreshing={settings.isFetching && !settings.isLoading}>
      <QueryStatus isLoading={settings.isLoading} error={settings.error} onRetry={settings.refetch} />
      {settings.data ? (
        // Starts from the saved values once; later refetches don't overwrite what's being typed.
        <FeesForm saved={settings.data} />
      ) : null}
    </Screen>
  )
}

const Modes = { 'Flat ₹': 'FLAT', 'Percent %': 'PERCENT' } as const
type ModeLabel = keyof typeof Modes

function FeesForm({ saved }: { saved: PlatformSettings }) {
  const [mode, setMode] = useState<ModeLabel>(saved.platformFeeMode === 'PERCENT' ? 'Percent %' : 'Flat ₹')
  const [fee, setFee] = useState(String(saved.platformFeeValue))
  const [delivery, setDelivery] = useState(String(saved.deliveryFee))
  const [freeAbove, setFreeAbove] = useState(String(saved.freeDeliveryAbove))
  const [error, setError] = useState<string | null>(null)
  const [update, state] = useUpdateSettingsMutation()

  const percent = Modes[mode] === 'PERCENT'

  const save = async () => {
    const values = { fee: Number(fee), delivery: Number(delivery), freeAbove: Number(freeAbove || 0) }
    if (Object.values(values).some((v) => !Number.isFinite(v) || v < 0)) {
      setError('Fees must be zero or more.')
      return
    }
    if (percent && values.fee > 100) {
      setError('A percentage fee cannot exceed 100%.')
      return
    }
    setError(null)
    try {
      await update({
        platformFeeMode: Modes[mode],
        platformFeeValue: values.fee,
        deliveryFee: values.delivery,
        freeDeliveryAbove: values.freeAbove,
      }).unwrap()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  // Example for a ₹500 order, so the effect of the numbers is obvious.
  const example = 500
  const exampleFee = percent ? Math.round((example * (Number(fee) || 0)) / 100) : Number(fee) || 0
  const freeDelivery = Number(freeAbove) > 0 && example >= Number(freeAbove)
  const exampleDelivery = freeDelivery ? 0 : Number(delivery) || 0

  return (
    <>
      <Section title="Platform fee">
        <Card style={styles.form}>
          <ChipGroup options={Object.keys(Modes) as ModeLabel[]} value={mode} onChange={setMode} />
          <TextField
            label={percent ? 'Fee (% of items total)' : 'Fee per order (₹)'}
            value={fee}
            onChangeText={setFee}
            keyboardType="decimal-pad"
          />
        </Card>
      </Section>

      <Section title="Delivery">
        <Card style={styles.form}>
          <TextField label="Delivery fee per order (₹)" value={delivery} onChangeText={setDelivery} keyboardType="decimal-pad" />
          <TextField
            label="Free delivery above (₹, 0 = never)"
            value={freeAbove}
            onChangeText={setFreeAbove}
            keyboardType="decimal-pad"
          />
        </Card>
      </Section>

      <Card style={styles.example}>
        <ThemedText type="smallBold">Example: {formatPrice(example)} order</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Platform fee {formatPrice(exampleFee)} · Delivery {exampleDelivery ? formatPrice(exampleDelivery) : 'free'} ·
          Customer pays {formatPrice(example + exampleFee + exampleDelivery)}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Per-item fees and markups set in the web admin panel are added on top.
        </ThemedText>
      </Card>

      {error ? (
        <View accessibilityRole="alert">
          <ThemedText type="small" themeColor="danger">
            {error}
          </ThemedText>
        </View>
      ) : null}
      {state.isSuccess && !error ? (
        <ThemedText type="small" themeColor="success">
          Saved. New orders use these fees.
        </ThemedText>
      ) : null}

      <Button label="Save fees" onPress={save} loading={state.isLoading} block />
    </>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  example: {
    gap: Spacing.one,
  },
})
