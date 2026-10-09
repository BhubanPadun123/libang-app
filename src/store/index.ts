import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { customerApi } from './customer-api'
import appReducer from './slices/app-slice'
import { clearSession, saveSession } from '@/services/session-storage'
import authReducer, { signIn, signOut, userRefreshed } from './slices/auth-slice'
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

// Keeps the device's saved session in step with sign-in, so the next launch skips the login screen.
const persistSession = createListenerMiddleware()
persistSession.startListening({
  matcher: isAnyOf(signIn, userRefreshed),
  effect: (_, api) => {
    const { user, token } = (api.getState() as RootState).auth
    if (user && token) saveSession({ user, token })
  },
})
persistSession.startListening({
  actionCreator: signOut,
  effect: () => {
    clearSession()
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
  middleware: (getDefault) => getDefault().prepend(clearOnSignOut.middleware, persistSession.middleware).concat(customerApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
