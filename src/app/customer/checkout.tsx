import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { QueryStatus } from '@/components/catalog/query-status'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { TextField } from '@/components/ui/text-field'
import { Radius, Spacing } from '@/constants/theme'
import { useCurrentLocation, type PinnedLocation } from '@/hooks/use-current-location'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage, useGetCartQuery, usePlaceOrderMutation } from '@/store/customer-api'
import { useAppSelector } from '@/store/hooks'
import type { DeliveryAddress } from '@/types/catalog'
import { formatPrice } from '@/utils/format'

/** Mirrors the server's checks so mistakes show before the request. */
function validate(address: DeliveryAddress) {
  if (address.name.trim().length < 2) return 'Enter the name to deliver to.'
  if (address.phone.replace(/\D/g, '').length < 10) return 'Enter a valid 10-digit phone number.'
  if (address.address.trim().length < 5) return 'Enter the full delivery address.'
  return null
}

export default function CheckoutScreen() {
  const theme = useTheme()
  const userName = useAppSelector((s) => s.auth.user?.name ?? '')
  const cart = useGetCartQuery()
  const [placeOrder, placing] = usePlaceOrderMutation()

  const [address, setAddress] = useState<DeliveryAddress>({
    name: userName,
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [pin, setPin] = useState<PinnedLocation | null>(null)
  const location = useCurrentLocation()
  const set = (field: keyof DeliveryAddress) => (value: string) => setAddress((a) => ({ ...a, [field]: value }))

  const useMyLocation = async () => {
    const found = await location.locate()
    if (!found) return
    setPin(found)
    // Only fill fields the customer left empty, so typed details aren't overwritten.
    setAddress((a) => ({
      ...a,
      address: a.address || found.address?.line || '',
      city: a.city || found.address?.city || '',
      state: a.state || found.address?.state || '',
      pincode: a.pincode || found.address?.pincode || '',
    }))
  }

  const charges = cart.data?.charges

  const submit = async () => {
    const invalid = validate(address)
    setError(invalid)
    if (invalid) return
    try {
      await placeOrder({
        ...address,
        phone: address.phone.trim(),
        ...(pin && { latitude: pin.latitude, longitude: pin.longitude }),
      }).unwrap()
      router.dismissTo('/customer/orders')
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <Screen safeTop={false}>
      <QueryStatus isLoading={cart.isLoading} error={cart.error} onRetry={cart.refetch} />

      <Section title="Deliver to">
        <Card style={styles.form}>
          <View style={styles.row}>
            <Icon
              sf={pin ? 'mappin.circle.fill' : 'location.fill'}
              md={pin ? 'where_to_vote' : 'my_location'}
              size={20}
              color={pin ? theme.success : theme.primary}
            />
            <ThemedText type="small" style={styles.flex} themeColor={pin ? 'success' : 'textSecondary'}>
              {pin ? 'Location pinned. Your rider will see it on a map.' : 'Share your location so the rider can find you.'}
            </ThemedText>
            {pin ? (
              <Button label="Remove" size="sm" variant="ghost" onPress={() => setPin(null)} />
            ) : (
              <Button label="Use my location" size="sm" variant="secondary" loading={location.loading} onPress={useMyLocation} />
            )}
          </View>
          {location.error ? (
            <ThemedText type="caption" themeColor="danger">
              {location.error}
            </ThemedText>
          ) : null}
          <TextField
            label="Full name"
            icon={{ sf: 'person.fill', md: 'person' }}
            value={address.name}
            onChangeText={set('name')}
            autoComplete="name"
            textContentType="name"
          />
          <TextField
            label="Phone"
            icon={{ sf: 'phone.fill', md: 'call' }}
            value={address.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          <TextField
            label="Address"
            icon={{ sf: 'house.fill', md: 'home' }}
            value={address.address}
            onChangeText={set('address')}
            placeholder="House, street, landmark"
            autoComplete="street-address"
            textContentType="fullStreetAddress"
            multiline
          />
          <View style={styles.pair}>
            <View style={styles.half}>
              <TextField label="City" value={address.city} onChangeText={set('city')} textContentType="addressCity" />
            </View>
            <View style={styles.half}>
              <TextField
                label="PIN code"
                value={address.pincode}
                onChangeText={set('pincode')}
                keyboardType="number-pad"
                autoComplete="postal-code"
                textContentType="postalCode"
              />
            </View>
          </View>
          <TextField label="State" value={address.state} onChangeText={set('state')} textContentType="addressState" />
        </Card>
      </Section>

      {charges ? (
        <Section title="Payment">
          <Card style={styles.summary}>
            <View style={styles.row}>
              <Icon sf="banknote.fill" md="payments" size={20} color={theme.success} />
              <ThemedText type="smallBold" style={styles.flex}>
                Cash on delivery
              </ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <ThemedText themeColor="textSecondary" style={styles.flex}>
                {cart.data?.totalItems} {cart.data?.totalItems === 1 ? 'item' : 'items'} incl. fees
              </ThemedText>
              <ThemedText type="heading">{formatPrice(charges.totalAmount)}</ThemedText>
            </View>
          </Card>
        </Section>
      ) : null}

      {error ? (
        <View accessibilityRole="alert" style={[styles.error, { backgroundColor: theme.dangerSoft }]}>
          <Icon sf="exclamationmark.triangle.fill" md="error" size={18} color={theme.danger} />
          <ThemedText type="small" style={[styles.flex, { color: theme.danger }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Button
        label={charges ? `Place order · ${formatPrice(charges.totalAmount)}` : 'Place order'}
        onPress={submit}
        loading={placing.isLoading}
        disabled={!charges?.totalAmount}
        block
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  half: {
    flex: 1,
  },
  summary: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
})
