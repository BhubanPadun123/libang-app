import type { Role } from '@/constants/roles'
import { apiFetch } from '@/services/api'
import type { AuthUser } from '@/store/slices/auth-slice'

/** Roles as stored by the backend (User.role in the Next.js app). */
type ServerRole =
  | 'CUSTOMER'
  | 'STORE_OWNER'
  | 'RESTAURANT_OWNER'
  | 'ROOM_OWNER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'STUFT'
  | 'DELIVERY_PARTNER'

const ServerRoleMap: Partial<Record<ServerRole, Role>> = {
  CUSTOMER: 'customer',
  STORE_OWNER: 'store_owner',
  RESTAURANT_OWNER: 'restaurant_owner',
  ROOM_OWNER: 'room_owner',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  DELIVERY_PARTNER: 'delivery',
}

type LoginResponse = {
  id: string
  name: string
  email: string
  role: ServerRole
  accessToken: string
}

export type Session = {
  user: AuthUser
  token: string
}

export async function login(email: string, password: string): Promise<Session> {
  const data = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  })

  const role = ServerRoleMap[data.role]
  if (!role) {
    throw new Error("This account type isn't supported in the app yet.")
  }

  return {
    user: { id: String(data.id), name: data.name, email: data.email, role },
    token: data.accessToken,
  }
}

/**
 * Ends the session on the server so the account can sign in elsewhere right away.
 * Best effort: if it fails, the server frees the account once the heartbeat stops.
 */
export async function logout(token: string | null) {
  if (!token) return
  try {
    await apiFetch('/api/auth/logout', { method: 'POST', token })
  } catch {
    // Signing out locally must never be blocked by the network.
  }
}
