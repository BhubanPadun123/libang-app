import { StyleSheet, View } from 'react-native'

import { ListingIcon, ListingImage } from '@/components/catalog/listing-image'
import { QuantityStepper } from '@/components/catalog/quantity-stepper'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spacing } from '@/constants/theme'
import { useCartLine } from '@/hooks/use-cart-line'
import { useTheme } from '@/hooks/use-theme'
import type { Listing, ListingType } from '@/types/catalog'
import { formatPrice } from '@/utils/format'

function details(listing: Listing, type: ListingType) {
  const parts =
    type === 'ROOM'
      ? [listing.location?.city, listing.amenities?.slice(0, 2).join(', ')]
      : [listing.category, listing.unit]
  return parts.filter(Boolean).join(' · ')
}

/** A sellable item with its price and an add-to-cart control that turns into a quantity stepper. */
export function ListingRow({ listing, type }: { listing: Listing; type: ListingType }) {
  const theme = useTheme()
  const line = useCartLine(type, listing._id)
  const meta = details(listing, type)
  const showMrp = listing.mrp && listing.mrp > listing.price

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <ListingImage uri={listing.images[0]} fallback={ListingIcon[type]} style={styles.image} />
        <View style={styles.text}>
          <View style={styles.titleRow}>
            {type === 'FOOD' && listing.isVeg !== undefined ? (
              <View
                accessibilityLabel={listing.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                style={[styles.vegMark, { borderColor: listing.isVeg ? theme.success : theme.danger }]}>
                <View style={[styles.vegDot, { backgroundColor: listing.isVeg ? theme.success : theme.danger }]} />
              </View>
            ) : null}
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {listing.name}
            </ThemedText>
          </View>
          {meta ? (
            <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
              {meta}
            </ThemedText>
          ) : null}
          {listing.description ? (
            <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
              {listing.description}
            </ThemedText>
          ) : null}
          <View style={styles.priceRow}>
            <ThemedText type="smallBold">
              {formatPrice(listing.price)}
              {type === 'ROOM' ? <ThemedText type="caption"> /night</ThemedText> : null}
            </ThemedText>
            {showMrp ? (
              <ThemedText type="caption" themeColor="textSecondary" style={styles.mrp}>
                {formatPrice(listing.mrp!)}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {line.error ? (
          <ThemedText type="caption" style={[styles.error, { color: theme.danger }]} numberOfLines={2}>
            {line.error}
          </ThemedText>
        ) : (
          <View style={styles.error} />
        )}
        {line.quantity > 0 ? (
          <QuantityStepper value={line.quantity} onChange={line.change} busy={line.busy} />
        ) : (
          <Button
            label={type === 'ROOM' ? 'Book' : 'Add'}
            size="sm"
            icon={{ sf: 'plus', md: 'add' }}
            loading={line.busy}
            onPress={line.add}
          />
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  image: {
    width: 84,
    height: 84,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    flexShrink: 1,
  },
  vegMark: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  mrp: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  error: {
    flex: 1,
  },
})
