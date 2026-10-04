import { UsersScreen } from '@/components/admin/users-screen'

/** Read-only for admins; role changes and deletion are super-admin only. */
export default function AdminUsersScreen() {
  return <UsersScreen title="Users" />
}
