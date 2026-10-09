import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

import type { Session } from '@/services/auth-service'

const SESSION_KEY = 'libang.session'

/**
 * Where the signed-in session is kept between launches. On phones it lives in the Keychain /
 * Keystore; the web build has no secure store, so it falls back to localStorage there.
 */
const storage = {
  get: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.setItem(key, value)) : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.removeItem(key)) : SecureStore.deleteItemAsync(key),
}

function isSession(value: unknown): value is Session {
  const session = value as Session | null
  return typeof session?.token === 'string' && typeof session.user?.id === 'string' && typeof session.user.role === 'string'
}

/** The session saved at the last sign-in, or null when there is none (or it can't be read). */
export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await storage.get(SESSION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function saveSession(session: Session) {
  try {
    await storage.set(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Not fatal: the user just signs in again next launch.
  }
}

export async function clearSession() {
  try {
    await storage.remove(SESSION_KEY)
  } catch {
    // Nothing more to do; a stale entry is rejected by the server on the next launch.
  }
}
