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
}

const initialState: AuthState = {
  user: null,
  token: null,
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
  },
})

export const { signIn, signOut } = authSlice.actions
export default authSlice.reducer
