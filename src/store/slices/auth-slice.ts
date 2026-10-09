import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Role } from '@/constants/roles'

export type AuthUser = {
  id: string
  name: string
  email?: string
  role: Role
}

type AuthState = {
  user: AuthUser | null
  /** Backend JWT, sent as a Bearer token on authenticated requests. */
  token: string | null
  /** False until the session saved on this device has been read at launch. */
  restored: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  restored: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    signOut(state) {
      state.user = null
      state.token = null
    },
    /** The session read from the device at launch, or null when there was none. */
    sessionRestored(state, action: PayloadAction<{ user: AuthUser; token: string } | null>) {
      state.user = action.payload?.user ?? null
      state.token = action.payload?.token ?? null
      state.restored = true
    },
    /** Fresh account details from the server, e.g. after an admin changed the role. */
    userRefreshed(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
  },
})

export const { signIn, signOut, sessionRestored, userRefreshed } = authSlice.actions
export default authSlice.reducer
