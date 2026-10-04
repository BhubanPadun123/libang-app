import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { customerApi } from './customer-api'
import appReducer from './slices/app-slice'
import authReducer, { signOut } from './slices/auth-slice'
import notificationsReducer from './slices/notifications-slice'
import sessionReducer from './slices/session-slice'

// The next account on this device must never see the previous one's cart or orders.
const clearOnSignOut = createListenerMiddleware()
clearOnSignOut.startListening({
  actionCreator: signOut,
  effect: (_, api) => {
    api.dispatch(customerApi.util.resetApiState())
  },
})

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    notifications: notificationsReducer,
    session: sessionReducer,
    [customerApi.reducerPath]: customerApi.reducer,
  },
  middleware: (getDefault) => getDefault().prepend(clearOnSignOut.middleware).concat(customerApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
