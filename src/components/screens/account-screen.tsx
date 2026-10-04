import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListCard, ListItem } from '@/components/ui/list-item'
import { Screen } from '@/components/ui/screen'
import { Section } from '@/components/ui/section'
import { RoleLabels } from '@/constants/roles'
import { Spacing } from '@/constants/theme'
import { logout } from '@/services/auth-service'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { signOut } from '@/store/slices/auth-slice'

/** Shared account tab used by every role. */
export function AccountScreen() {
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)
  const dispatch = useAppDispatch()

  const handleSignOut = () => {
    // Sign out locally at once; the server call only frees the account for other devices.
    void logout(token)
    dispatch(signOut())
  }

  if (!user) return null

  return (
    <Screen title="Account">
      <Card style={styles.profile}>
        <Avatar name={user.name} size={60} />
        <View style={styles.profileText}>
          <ThemedText type="heading">{user.name}</ThemedText>
          <Badge label={RoleLabels[user.role]} tone="primary" />
        </View>
      </Card>

      <Section title="Settings">
        <ListCard>
          <ListItem title="Personal details" icon={{ sf: 'person.fill', md: 'person' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Addresses" icon={{ sf: 'mappin.and.ellipse', md: 'location_on' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Notifications" icon={{ sf: 'bell.fill', md: 'notifications' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Payment methods" icon={{ sf: 'creditcard.fill', md: 'credit_card' }} iconTone="neutral" onPress={() => {}} />
        </ListCard>
      </Section>

      <Section title="Support">
        <ListCard>
          <ListItem title="Help centre" icon={{ sf: 'questionmark.circle.fill', md: 'help' }} iconTone="neutral" onPress={() => {}} />
          <ListItem title="Terms & privacy" icon={{ sf: 'doc.text.fill', md: 'description' }} iconTone="neutral" onPress={() => {}} />
        </ListCard>
      </Section>

      <Button
        label="Sign out"
        variant="danger"
        icon={{ sf: 'rectangle.portrait.and.arrow.right', md: 'logout' }}
        onPress={handleSignOut}
        block
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  profileText: {
    flex: 1,
    gap: Spacing.one,
  },
})
