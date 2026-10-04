import { router } from 'expo-router'
import { useEffect } from 'react'
import { AppState } from 'react-native'

import { isMerchantRole, ordersRoute, type Role } from '@/constants/roles'
import { onOrderAlertOpened, playOrderAlert, prepareOrderAlerts } from '@/services/order-alerts'
import { RealtimeConnection, type RevokeReason } from '@/services/realtime'
import { customerApi } from '@/store/customer-api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { signOut } from '@/store/slices/auth-slice'
import { connectionChanged, orderReceived } from '@/store/slices/notifications-slice'
import { sessionEnded } from '@/store/slices/session-slice'

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

    const alerts = receivesOrderAlerts(role)
    // Ask for notification permission up front so the first order isn't silent.
    if (alerts) prepareOrderAlerts()

    // The server may resend an order after a reconnect; ring once per order.
    const rung = new Set<string>()

    const connection = new RealtimeConnection(token, {
      onOrderCreated: (order) => {
        if (!alerts) return
        dispatch(orderReceived(order))
        // Owners' order list and stats come from the server; refetch whatever is on screen.
        dispatch(customerApi.util.invalidateTags(['OwnerOrders', 'OwnerStats']))
        if (rung.has(order.id)) return
        rung.add(order.id)
        playOrderAlert(order).catch(() => {})
      },
      onSessionRevoked: (reason) => {
        dispatch(sessionEnded(RevokedMessage[reason]))
        dispatch(signOut())
      },
      onStatusChange: (connected) => dispatch(connectionChanged(connected)),
    })
    connection.connect()

    // Mobile OSes drop sockets in the background; reconnect as soon as the app is back.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') connection.connect()
    })

    const removeOpenListener = onOrderAlertOpened(() => {
      const route = ordersRoute(role)
      if (route) router.navigate(route)
    })

    return () => {
      subscription.remove()
      removeOpenListener()
      connection.disconnect()
    }
  }, [token, role, dispatch])
}
