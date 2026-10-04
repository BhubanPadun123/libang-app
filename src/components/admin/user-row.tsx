import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { ListItem } from '@/components/ui/list-item'
import { AssignableRoles, ServerRoleLabel, ServerRoleTone } from '@/constants/server-roles'
import { Spacing } from '@/constants/theme'
import { useDeleteUserMutation, useSetUserRoleMutation } from '@/store/admin-api'
import { errorMessage } from '@/store/customer-api'
import { useAppSelector } from '@/store/hooks'
import type { AdminUser } from '@/types/admin'

function joined(iso?: string) {
  if (!iso) return undefined
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? undefined
    : `Joined ${date.toLocaleDateString([], { month: 'short', year: 'numeric' })}`
}

type UserRowProps = {
  user: AdminUser
  /** Super admins can change roles and delete accounts. */
  manageable?: boolean
}

export function UserRow({ user, manageable }: UserRowProps) {
  const selfId = useAppSelector((s) => s.auth.user?.id)
  const isSelf = user._id === selfId
  const [open, setOpen] = useState(false)

  const subtitle = [user.email, user.phone, joined(user.createdAt)].filter(Boolean).join(' · ')

  return (
    <View>
      <ListItem
        title={isSelf ? `${user.name} (you)` : user.name}
        subtitle={subtitle}
        leading={<Avatar name={user.name} size={40} />}
        trailing={<Badge label={ServerRoleLabel[user.role] ?? user.role} tone={ServerRoleTone[user.role] ?? 'neutral'} />}
        onPress={manageable && !isSelf ? () => setOpen((o) => !o) : undefined}
      />
      {open ? <ManagePanel user={user} onDone={() => setOpen(false)} /> : null}
    </View>
  )
}

function ManagePanel({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const [setRole, roleState] = useSetUserRoleMutation()
  const [remove, removeState] = useDeleteUserMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const error = roleState.error ?? removeState.error
  const busy = roleState.isLoading || removeState.isLoading

  const destroy = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await remove(user._id).unwrap()
      onDone()
    } catch {
      setConfirmDelete(false)
    }
  }

  return (
    <View style={styles.panel}>
      <ThemedText type="caption" themeColor="textSecondary">
        Change role
      </ThemedText>
      <View style={styles.roles}>
        {AssignableRoles.map((role) => (
          <Chip
            key={role}
            label={ServerRoleLabel[role]}
            selected={role === user.role}
            onPress={busy || role === user.role ? undefined : () => setRole({ userId: user._id, role })}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Button
          label={confirmDelete ? 'Tap again to delete' : 'Delete account'}
          size="sm"
          variant="danger"
          icon={{ sf: 'trash.fill', md: 'delete' }}
          loading={removeState.isLoading}
          disabled={roleState.isLoading}
          onPress={destroy}
        />
      </View>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {errorMessage(error)}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
  },
})
