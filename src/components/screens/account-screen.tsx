import { Button } from 'react-native-paper'

import { PlaceholderScreen } from '@/components/screens/placeholder-screen'
import { RoleLabels } from '@/constants/roles'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { signOut } from '@/store/slices/auth-slice'

/** Shared account tab used by every role. */
export function AccountScreen() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  return (
    <PlaceholderScreen
      title={user?.name ?? 'Account'}
      description={user ? RoleLabels[user.role] : undefined}>
      <Button mode="contained" onPress={() => dispatch(signOut())}>
        Sign out
      </Button>
    </PlaceholderScreen>
  )
}
