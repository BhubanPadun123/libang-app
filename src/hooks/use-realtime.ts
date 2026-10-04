import { useEffect } from 'react'
import { AppState } from 'react-native'

import { isMerchantRole, type Role } from '@/constants/roles'
import { RealtimeConnection, type RevokeReason } from '@/services/realtime'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { signOut } from '@/store/slices/auth-slice'
import { connectionChanged, orderReceived } from '@/store/slices/notifications-slice'

/** Roles that get a live alert when a customer places an order. */
export function receivesOrderAlerts(role: Role | undefined) {
  return role === 'admin' || role === 'super_admin' || isMerchantRole(role)
}

const RevokedMessage: Record<RevokeReason, string> = {
  session_replaced: 'You were signed out because this session ended or your account is now in use on another device.',
  unauthorized: 'Your session has expired. Please sign in again.',
}

/**
 * Keeps a socket open for the signed-in session. It delivers live order alerts, and its
 * heartbeat is what keeps this device the account's one active session on the server.
 */
export function useRealtime() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const role = useAppSelector((s) => s.auth.user?.role)

  useEffect(() => {
    if (!token) return

    const connection = new RealtimeConnection(token, {
      onOrderCreated: (order) => {
        if (receivesOrderAlerts(role)) dispatch(orderReceived(order))
      },
      onSessionRevoked: (reason) => dispatch(signOut({ reason: RevokedMessage[reason] })),
      onStatusChange: (connected) => dispatch(connectionChanged(connected)),
    })
    connection.connect()

    // Mobile OSes drop sockets in the background; reconnect as soon as the app is back.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') connection.connect()
    })

    return () => {
      subscription.remove()
      connection.disconnect()
    }
  }, [token, role, dispatch])
}
