import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type AppState = {
  isOnboarded: boolean
}

const initialState: AppState = {
  isOnboarded: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnboarded(state, action: PayloadAction<boolean>) {
      state.isOnboarded = action.payload
    },
  },
})

export const { setOnboarded } = appSlice.actions
export default appSlice.reducer
