import Constants from 'expo-constants'
import { Platform } from 'react-native'

/** The live backend. Release builds always use it. */
export const PRODUCTION_API_URL = 'https://www.libangexpress.in'

const DEV_API_PORT = 3000
const PROBE_TIMEOUT_MS = 2_500

const trimSlash = (url: string) => url.replace(/\/+$/, '')

/**
 * The backend on the developer's machine. Devices reach it on the same host they reach
 * Metro on (physical devices on the same Wi-Fi, and emulators).
 */
function localApiUrl() {
  const host =
    Platform.OS === 'web' ? globalThis.location?.hostname : Constants.expoConfig?.hostUri?.split(':')[0]
  return `http://${host || 'localhost'}:${DEV_API_PORT}`
}

/** Whether the local backend answers quickly; a cheap public endpoint keeps the probe light. */
async function isReachable(baseUrl: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const response = await fetch(`${baseUrl}/api/settings`, { signal: controller.signal })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

let resolved: Promise<string> | null = null

/**
 * Base URL of the Next.js backend:
 * - EXPO_PUBLIC_API_URL, when set, always wins.
 * - Release builds use PRODUCTION_API_URL.
 * - In development, the local backend if it answers, otherwise PRODUCTION_API_URL.
 *
 * Decided once and cached; `forgetApiUrl` makes the next request decide again.
 */
export function getApiUrl(): Promise<string> {
  resolved ??= (async () => {
    const fromEnv = process.env.EXPO_PUBLIC_API_URL
    if (fromEnv) return trimSlash(fromEnv)
    if (!__DEV__) return PRODUCTION_API_URL

    const local = localApiUrl()
    if (await isReachable(local)) return local
    console.info(`[api] Local backend at ${local} isn't reachable; using ${PRODUCTION_API_URL}`)
    return PRODUCTION_API_URL
  })()
  return resolved
}

/** Called after a network failure, so a local server that went away (or came back) is noticed. */
export function forgetApiUrl() {
  resolved = null
}

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

  const baseUrl = await getApiUrl()

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
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
    forgetApiUrl()
    throw new ApiError(`Can't reach the server at ${baseUrl}. Check your internet connection and try again.`, 0)
  } finally {
    clearTimeout(timeout)
  }

  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !json?.success) {
    throw new ApiError(json?.message || `Request failed (${response.status})`, response.status)
  }

  return { data: json.data as T, meta: json.meta }
}
