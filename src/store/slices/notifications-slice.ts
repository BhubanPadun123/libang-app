import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { OrderNotification } from '@/services/realtime'
import { signOut } from './auth-slice'

/** Keeps memory bounded on busy admin accounts. */
const MAX_LIVE_ORDERS = 50

type NotificationsState = {
  /** Orders pushed over the socket this session, newest first. */
  liveOrders: OrderNotification[]
  /** Live orders not yet seen on the Orders screen. */
  unreadCount: number
  /** The order shown in the in-app banner, if any. */
  toast: OrderNotification | null
  connected: boolean
}

const initialState: NotificationsState = {
  liveOrders: [],
  unreadCount: 0,
  toast: null,
  connected: false,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    orderReceived(state, action: PayloadAction<OrderNotification>) {
      // The server may resend after a reconnect, so ignore orders we already have.
      if (state.liveOrders.some((o) => o.id === action.payload.id)) return
      state.liveOrders.unshift(action.payload)
      state.liveOrders.splice(MAX_LIVE_ORDERS)
      state.unreadCount += 1
      state.toast = action.payload
    },
    ordersSeen(state) {
      state.unreadCount = 0
    },
    toastDismissed(state) {
      state.toast = null
    },
    connectionChanged(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut, () => initialState)
  },
})

export const { orderReceived, ordersSeen, toastDismissed, connectionChanged } = notificationsSlice.actions
export default notificationsSlice.reducer
