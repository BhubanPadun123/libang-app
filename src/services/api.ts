import Constants from 'expo-constants'
import { Platform } from 'react-native'

const DEV_API_PORT = 3000

/**
 * Base URL of the Next.js backend.
 *
 * Set EXPO_PUBLIC_API_URL to override. Otherwise, in development, the backend is
 * assumed to run on the same machine as Metro, so we reuse the host the device
 * already reaches Metro on (works for physical devices on the same Wi‑Fi and emulators).
 */
function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  const host =
    Platform.OS === 'web'
      ? globalThis.location?.hostname
      : Constants.expoConfig?.hostUri?.split(':')[0]

  return `http://${host || 'localhost'}:${DEV_API_PORT}`
}

export const API_URL = resolveApiUrl()

const TIMEOUT_MS = 15_000

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type PageMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data?: T
  /** Present on paginated list endpoints. */
  meta?: PageMeta
}

type ApiRequest = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

/** Calls a Next.js route handler and unwraps its `{ success, message, data }` envelope. */
export async function apiFetch<T>(path: string, request: ApiRequest = {}): Promise<T> {
  return (await apiFetchPage<T>(path, request)).data
}

/** Like `apiFetch`, but also returns the paging `meta` that list endpoints send. */
export async function apiFetchPage<T>(
  path: string,
  { method = 'GET', body, token }: ApiRequest = {},
): Promise<{ data: T; meta?: PageMeta }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new ApiError(`Can't reach the server at ${API_URL}. Check that it's running and on the same network.`, 0)
  } finally {
    clearTimeout(timeout)
  }

  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !json?.success) {
    throw new ApiError(json?.message || `Request failed (${response.status})`, response.status)
  }

  return { data: json.data as T, meta: json.meta }
}
