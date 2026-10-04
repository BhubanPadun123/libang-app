import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Role } from '@/constants/roles'

export type AuthUser = {
  id: string
  name: string
  role: Role
}

type AuthState = {
  user: AuthUser | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
    signOut(state) {
      state.user = null
    },
  },
})

export const { signIn, signOut } = authSlice.actions
export default authSlice.reducer
