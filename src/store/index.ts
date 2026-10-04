import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/app-slice'
import authReducer from './slices/auth-slice'
import notificationsReducer from './slices/notifications-slice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
