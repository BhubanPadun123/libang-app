import { useEffect } from 'react'
import { useStore } from 'react-redux'

import { ApiError } from '@/services/api'
import { fetchCurrentUser } from '@/services/auth-service'
import { loadSession } from '@/services/session-storage'
import type { RootState } from '@/store'
import { useAppDispatch } from '@/store/hooks'
import { sessionRestored, signOut, userRefreshed } from '@/store/slices/auth-slice'
import { sessionEnded } from '@/store/slices/session-slice'

/**
 * Signs the user back in from the session saved on this device, so a returning user never
 * sees the login screen.
 *
 * The app opens on the saved session straight away instead of waiting on the network, then
 * checks it with the server in the background: a token the server rejects signs the user out,
 * while being offline keeps them signed in.
 */
export function useRestoreSession() {
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const saved = await loadSession()
      if (cancelled) return
      dispatch(sessionRestored(saved))
      if (!saved) return

      try {
        const user = await fetchCurrentUser(saved.token)
        // The user may have signed out, or in as someone else, while this was in flight.
        if (!cancelled && store.getState().auth.token === saved.token) dispatch(userRefreshed(user))
      } catch (e) {
        if (cancelled || store.getState().auth.token !== saved.token) return
        if (e instanceof ApiError && e.status === 401) {
          dispatch(sessionEnded('Your session has expired. Please sign in again.'))
          dispatch(signOut())
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [dispatch, store])
}
