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
  /** Why the last session ended, when it wasn't the user's choice. Shown on the sign-in screen. */
  signOutReason: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  signOutReason: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.signOutReason = null
    },
    signOut(state, action: PayloadAction<{ reason?: string } | undefined>) {
      state.user = null
      state.token = null
      state.signOutReason = action.payload?.reason ?? null
    },
    signOutReasonCleared(state) {
      state.signOutReason = null
    },
  },
})

export const { signIn, signOut, signOutReasonCleared } = authSlice.actions
export default authSlice.reducer
