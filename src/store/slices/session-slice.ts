import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { signIn } from './auth-slice'

type SessionState = {
  /** Why the last session ended, when it wasn't the user's choice. Shown on the sign-in screen. */
  endedReason: string | null
}

const initialState: SessionState = {
  endedReason: null,
}

/** Kept apart from auth so the reason survives the `signOut` that follows it. */
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionEnded(state, action: PayloadAction<string>) {
      state.endedReason = action.payload
    },
    sessionEndedReasonCleared(state) {
      state.endedReason = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn, (state) => {
      state.endedReason = null
    })
  },
})

export const { sessionEnded, sessionEndedReasonCleared } = sessionSlice.actions
export default sessionSlice.reducer
