import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ordersSeen } from '@/store/slices/notifications-slice'

/** Clears the Orders tab's unread badge while this screen is focused, including for orders arriving meanwhile. */
export function useClearOrderBadge(enabled = true) {
  const dispatch = useAppDispatch()
  const unread = useAppSelector((s) => s.notifications.unreadCount)

  useFocusEffect(
    useCallback(() => {
      if (enabled && unread > 0) dispatch(ordersSeen())
    }, [enabled, unread, dispatch])
  )
}
