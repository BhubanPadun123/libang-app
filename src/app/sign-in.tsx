import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import { router } from 'expo-router'

import { PlaceholderScreen } from '@/components/screens/placeholder-screen'
import { ROLES, RoleHome, RoleLabels, type Role } from '@/constants/roles'
import { Spacing } from '@/constants/theme'
import { useAppDispatch } from '@/store/hooks'
import { signIn } from '@/store/slices/auth-slice'

// TODO: replace the role picker with real authentication; the role should come from the API.
export default function SignInScreen() {
  const dispatch = useAppDispatch()

  const handleSignIn = (role: Role) => {
    dispatch(signIn({ id: `dev-${role}`, name: `Demo ${RoleLabels[role]}`, role }))
    router.replace(RoleHome[role])
  }

  return (
    <PlaceholderScreen title="Libang Express" description="Sign in as (development only)">
      <View style={styles.buttons}>
        {ROLES.map((role) => (
          <Button key={role} mode="outlined" onPress={() => handleSignIn(role)}>
            {RoleLabels[role]}
          </Button>
        ))}
      </View>
    </PlaceholderScreen>
  )
}

const styles = StyleSheet.create({
  buttons: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
})
