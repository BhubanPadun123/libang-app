import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon, type IconName } from '@/components/ui/icon'
import type { Tone } from '@/components/ui/icon-bubble'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { ROLES, RoleHome, RoleLabels, type Role } from '@/constants/roles'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { useAppDispatch } from '@/store/hooks'
import { signIn } from '@/store/slices/auth-slice'

const RoleMeta: Record<Role, { description: string; icon: IconName; tone: Tone }> = {
  customer: { description: 'Order food, groceries and book rooms', icon: { sf: 'person.fill', md: 'person' }, tone: 'primary' },
  store_owner: { description: 'Sell products from your store', icon: { sf: 'storefront.fill', md: 'storefront' }, tone: 'info' },
  restaurant_owner: { description: 'Manage your menu and orders', icon: { sf: 'fork.knife', md: 'restaurant' }, tone: 'success' },
  room_owner: { description: 'List rooms and manage bookings', icon: { sf: 'bed.double.fill', md: 'hotel' }, tone: 'warning' },
  delivery: { description: 'Pick up and deliver orders', icon: { sf: 'bicycle', md: 'two_wheeler' }, tone: 'primary' },
  admin: { description: 'Operate partners, orders and users', icon: { sf: 'shield.fill', md: 'shield_person' }, tone: 'neutral' },
  super_admin: { description: 'Full platform control', icon: { sf: 'crown.fill', md: 'admin_panel_settings' }, tone: 'danger' },
}

// TODO: replace the role picker with real authentication; the role should come from the API.
export default function SignInScreen() {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const handleSignIn = (role: Role) => {
    dispatch(signIn({ id: `dev-${role}`, name: `Demo ${RoleLabels[role]}`, role }))
    router.replace(RoleHome[role])
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <Icon sf="shippingbox.fill" md="local_shipping" size={36} color={theme.onPrimary} />
        </View>
        <ThemedText style={styles.brand}>
          Libang<ThemedText style={[styles.brand, { color: theme.primary }]}>Express</ThemedText>
        </ThemedText>
        <ThemedText style={styles.tagline} themeColor="textSecondary">
          Food, groceries, stores and stays — delivered fast.
        </ThemedText>
      </View>

      <View style={styles.list}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          CONTINUE AS (DEMO)
        </ThemedText>
        <ListCard>
          {ROLES.map((role) => (
            <ListItem
              key={role}
              title={RoleLabels[role]}
              subtitle={RoleMeta[role].description}
              icon={RoleMeta[role].icon}
              iconTone={RoleMeta[role].tone}
              onPress={() => handleSignIn(role)}
            />
          ))}
        </ListCard>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.two,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  brand: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 800,
    letterSpacing: -0.8,
  },
  tagline: {
    textAlign: 'center',
  },
  list: {
    gap: Spacing.two,
  },
})
