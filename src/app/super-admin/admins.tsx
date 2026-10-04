import { UsersScreen } from '@/components/admin/users-screen'

/** Opens on the admin team, but any account's role can be managed from here. */
export default function SuperAdminAdminsScreen() {
  return <UsersScreen title="Team" initialFilter="Admins" manageable />
}
