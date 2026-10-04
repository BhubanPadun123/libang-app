import { Redirect } from 'expo-router'

import { RoleHome } from '@/constants/roles'
import { useAppSelector } from '@/store/hooks'

export default function Index() {
  const user = useAppSelector((s) => s.auth.user)
  return <Redirect href={user ? RoleHome[user.role] : '/sign-in'} />
}
