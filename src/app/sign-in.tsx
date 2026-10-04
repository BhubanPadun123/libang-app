import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { RoleMeta } from '@/constants/role-meta'
import { ROLES, RoleLabels, type Role } from '@/constants/roles'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export default function SignInScreen() {
  const theme = useTheme()

  const handleSelect = (role: Role) => {
    router.push({ pathname: '/login', params: { role } })
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
          CONTINUE AS
        </ThemedText>
        <ListCard>
          {ROLES.map((role) => (
            <ListItem
              key={role}
              title={RoleLabels[role]}
              subtitle={RoleMeta[role].description}
              icon={RoleMeta[role].icon}
              iconTone={RoleMeta[role].tone}
              onPress={() => handleSelect(role)}
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
