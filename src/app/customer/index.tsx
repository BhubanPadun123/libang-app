import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconBubble } from '@/components/ui/icon-bubble'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { Radius, Spacing } from '@/constants/theme'
import { Categories, NearbyPlaces } from '@/data/mock'
import { useTheme } from '@/hooks/use-theme'
import { useAppSelector } from '@/store/hooks'

export default function CustomerHomeScreen() {
  const theme = useTheme()
  const name = useAppSelector((s) => s.auth.user?.name ?? '')

  return (
    <Screen
      subtitle="Deliver to · Home"
      title={`Hi, ${name.split(' ')[0] || 'there'} 👋`}
      headerRight={<Avatar name={name} />}>
      <Pressable
        onPress={() => router.navigate('/customer/search')}
        style={[styles.search, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Icon sf="magnifyingglass" md="search" size={20} color={theme.textSecondary} />
        <ThemedText themeColor="textSecondary">Search food, stores, rooms…</ThemedText>
      </Pressable>

      <View style={styles.categories}>
        {Categories.map((c) => (
          <Pressable key={c.label} style={({ pressed }) => [styles.category, pressed && styles.pressed]}>
            <IconBubble icon={c.icon} tone={c.tone} size={56} />
            <ThemedText type="caption">{c.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.promo, { backgroundColor: theme.primary }]}>
        <View style={styles.promoText}>
          <ThemedText type="caption" style={styles.promoEyebrow}>
            LIMITED OFFER
          </ThemedText>
          <ThemedText style={styles.promoTitle}>Free delivery on your first 3 orders</ThemedText>
          <View style={styles.promoAction}>
            <Button label="Order now" variant="secondary" size="sm" />
          </View>
        </View>
        <Icon sf="gift.fill" md="redeem" size={64} color="rgba(255,255,255,0.9)" />
      </View>

      <Section title="Popular near you" actionLabel="See all">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.places}>
          {NearbyPlaces.map((p) => (
            <Card key={p.id} style={styles.place}>
              <View style={[styles.placeImage, { backgroundColor: theme.backgroundSelected }]}>
                <IconBubble icon={p.icon} tone={p.tone} size={56} />
              </View>
              <ThemedText type="smallBold" numberOfLines={1}>
                {p.name}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                {p.type}
              </ThemedText>
              <View style={styles.placeMeta}>
                <Icon sf="star.fill" md="star" size={14} color={theme.warning} />
                <ThemedText type="caption">{p.rating}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  · {p.eta}
                </ThemedText>
              </View>
            </Card>
          ))}
        </ScrollView>
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
  },
  category: {
    width: '33.33%',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  promoText: {
    flex: 1,
    gap: Spacing.one,
  },
  promoEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 800,
  },
  promoAction: {
    marginTop: Spacing.two,
  },
  places: {
    gap: Spacing.three,
  },
  place: {
    width: 180,
    gap: Spacing.one,
  },
  placeImage: {
    height: 100,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
})
