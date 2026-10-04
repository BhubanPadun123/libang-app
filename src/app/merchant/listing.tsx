import { router, Stack, useLocalSearchParams } from 'expo-router'
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
import { Toggle } from '@/components/ui/toggle'
import { Merchant } from '@/constants/merchant'
import { isMerchantRole } from '@/constants/roles'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/store/customer-api'
import { useAppSelector } from '@/store/hooks'
import {
  useCreateListingMutation,
  useDeleteListingMutation,
  useGetOwnerListingQuery,
  useUpdateListingMutation,
} from '@/store/owner-api'
import type { ListingType } from '@/types/catalog'
import type { ListingInput, OwnerListing } from '@/types/owner'

/** Create (no `id`) or edit (with `id`) one of the owner's listings. */
export default function ListingEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const role = useAppSelector((s) => s.auth.user?.role)
  const copy = Merchant[isMerchantRole(role) ? role : 'store_owner']
  const existing = useGetOwnerListingQuery(id ?? '', { skip: !id })

  const noun = copy.item.charAt(0).toUpperCase() + copy.item.slice(1)

  return (
    <>
      <Stack.Screen options={{ title: id ? `Edit ${copy.item}` : `New ${copy.item}` }} />
      {id && !existing.data ? (
        <Screen safeTop={false}>
          <QueryStatus isLoading={existing.isLoading} error={existing.error} onRetry={existing.refetch} />
        </Screen>
      ) : (
        // Keyed so the form starts from the loaded listing rather than stale state.
        <ListingForm key={existing.data?._id ?? 'new'} type={copy.listingType} noun={noun} initial={existing.data} />
      )}
    </>
  )
}

type FormState = {
  name: string
  description: string
  price: string
  images: string
  isAvailable: boolean
  category: string
  isVeg: boolean
  mrp: string
  stock: string
  unit: string
  city: string
  address: string
  amenities: string
}

function toForm(l?: OwnerListing): FormState {
  return {
    name: l?.name ?? '',
    description: l?.description ?? '',
    price: l ? String(l.price) : '',
    images: l?.images.join('\n') ?? '',
    isAvailable: l?.isAvailable ?? true,
    category: l?.category ?? '',
    isVeg: l?.isVeg ?? true,
    mrp: l?.mrp ? String(l.mrp) : '',
    stock: l?.stock !== undefined ? String(l.stock) : '',
    unit: l?.unit ?? '',
    city: l?.location?.city ?? '',
    address: l?.location?.address ?? '',
    amenities: l?.amenities?.join(', ') ?? '',
  }
}

const isUrl = (value: string) => /^https?:\/\/\S+$/i.test(value)

/** Mirrors the server's zod schemas, so mistakes show before saving. */
function toInput(form: FormState, type: ListingType): { input?: ListingInput; error?: string } {
  const price = Number(form.price)
  if (form.name.trim().length < 2) return { error: 'Enter a name (at least 2 characters).' }
  if (!form.price.trim() || !Number.isFinite(price) || price < 0) return { error: 'Enter a valid price.' }
  if (type === 'ROOM' && !form.description.trim()) return { error: 'Rooms need a description.' }

  const images = form.images.split(/\s+/).filter(Boolean)
  if (images.some((u) => !isUrl(u))) return { error: 'Each image must be a link starting with http:// or https://.' }
  if (images.length > 10) return { error: 'Add at most 10 images.' }

  const input: ListingInput = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    price,
    images,
    isAvailable: form.isAvailable,
  }

  if (type === 'FOOD') {
    input.category = form.category.trim() || undefined
    input.isVeg = form.isVeg
  }

  if (type === 'PRODUCT') {
    input.category = form.category.trim() || undefined
    input.unit = form.unit.trim() || undefined
    if (form.mrp.trim()) {
      const mrp = Number(form.mrp)
      if (!Number.isFinite(mrp) || mrp < 0) return { error: 'Enter a valid MRP.' }
      input.mrp = mrp
    }
    if (form.stock.trim()) {
      const stock = Number(form.stock)
      if (!Number.isInteger(stock) || stock < 0) return { error: 'Stock must be a whole number.' }
      input.stock = stock
    }
  }

  if (type === 'ROOM') {
    input.location = { city: form.city.trim() || undefined, address: form.address.trim() || undefined }
    input.amenities = form.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
  }

  return { input }
}

function ListingForm({ type, noun, initial }: { type: ListingType; noun: string; initial?: OwnerListing }) {
  const theme = useTheme()
  const [form, setForm] = useState(() => toForm(initial))
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [create, createState] = useCreateListingMutation()
  const [update, updateState] = useUpdateListingMutation()
  const [remove, removeState] = useDeleteListingMutation()
  const saving = createState.isLoading || updateState.isLoading

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    const { input, error: invalid } = toInput(form, type)
    setError(invalid ?? null)
    if (!input) return
    try {
      if (initial) await update({ id: initial._id, changes: input }).unwrap()
      else await create(input).unwrap()
      router.back()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  const destroy = async () => {
    if (!initial) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await remove(initial._id).unwrap()
      router.back()
    } catch (e) {
      setError(errorMessage(e))
      setConfirmDelete(false)
    }
  }

  return (
    <Screen safeTop={false}>
      <Section title="Details">
        <Card style={styles.form}>
          <TextField label="Name" value={form.name} onChangeText={set('name')} placeholder={`${noun} name`} />
          <TextField
            label={type === 'ROOM' ? 'Description' : 'Description (optional)'}
            value={form.description}
            onChangeText={set('description')}
            multiline
          />
          <TextField
            label={type === 'ROOM' ? 'Price per night (₹)' : 'Your price (₹)'}
            value={form.price}
            onChangeText={set('price')}
            keyboardType="decimal-pad"
          />
          <ThemedText type="caption" themeColor="textSecondary">
            Customers may see a slightly higher price after platform charges. You&apos;re paid this price.
          </ThemedText>

          {type !== 'ROOM' ? (
            <TextField
              label="Category (optional)"
              value={form.category}
              onChangeText={set('category')}
              placeholder={type === 'FOOD' ? 'e.g. Starters' : 'e.g. Groceries'}
            />
          ) : null}

          {type === 'FOOD' ? (
            <SwitchRow label="Vegetarian" value={form.isVeg} onChange={set('isVeg')} />
          ) : null}

          {type === 'PRODUCT' ? (
            <>
              <View style={styles.pair}>
                <View style={styles.half}>
                  <TextField label="MRP (₹)" value={form.mrp} onChangeText={set('mrp')} keyboardType="decimal-pad" />
                </View>
                <View style={styles.half}>
                  <TextField label="Stock" value={form.stock} onChangeText={set('stock')} keyboardType="number-pad" />
                </View>
              </View>
              <TextField label="Unit (optional)" value={form.unit} onChangeText={set('unit')} placeholder="e.g. 1 kg" />
            </>
          ) : null}

          {type === 'ROOM' ? (
            <>
              <TextField label="City" value={form.city} onChangeText={set('city')} />
              <TextField label="Address" value={form.address} onChangeText={set('address')} multiline />
              <TextField
                label="Amenities (comma separated)"
                value={form.amenities}
                onChangeText={set('amenities')}
                placeholder="Wi-Fi, AC, Parking"
              />
            </>
          ) : null}
        </Card>
      </Section>

      <Section title="Photos">
        <Card style={styles.form}>
          <TextField
            label="Image links (one per line)"
            value={form.images}
            onChangeText={set('images')}
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            multiline
          />
        </Card>
      </Section>

      <Card>
        <SwitchRow
          label="Available to customers"
          hint={form.isAvailable ? 'Customers can see and order this' : 'Hidden from customers'}
          value={form.isAvailable}
          onChange={set('isAvailable')}
        />
      </Card>

      {error ? (
        <View accessibilityRole="alert" style={[styles.error, { backgroundColor: theme.dangerSoft }]}>
          <Icon sf="exclamationmark.triangle.fill" md="error" size={18} color={theme.danger} />
          <ThemedText type="small" style={[styles.flex, { color: theme.danger }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Button label={initial ? 'Save changes' : `Add ${noun.toLowerCase()}`} onPress={save} loading={saving} block />
      {initial ? (
        <Button
          label={confirmDelete ? 'Tap again to delete' : `Delete ${noun.toLowerCase()}`}
          variant="danger"
          icon={{ sf: 'trash.fill', md: 'delete' }}
          onPress={destroy}
          loading={removeState.isLoading}
          disabled={saving}
          block
        />
      ) : null}
    </Screen>
  )
}

function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {hint ? (
          <ThemedText type="caption" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      <Toggle value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
})
