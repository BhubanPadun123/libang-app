import { getApiUrl } from '@/services/api'

/**
 * WebSocket endpoint of the backend. Set EXPO_PUBLIC_WS_URL to override; otherwise it's
 * derived from the API URL (http → ws, https → wss) with the `/ws` path.
 */
async function getWsUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_WS_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  return `${(await getApiUrl()).replace(/^http/, 'ws')}/ws`
}

/** Close codes the server uses for auth failures. Neither is retried. */
export const CloseCode = {
  /** Token missing, invalid or expired. */
  Unauthorized: 4001,
  /** This session is no longer the account's active one (signed out, or replaced after going offline). */
  SessionReplaced: 4002,
} as const

export type OrderNotification = {
  id: string
  /** Human-readable order number, e.g. `#LX1045`. */
  orderNumber: string
  customerName: string
  vendorName: string
  itemsSummary: string
  total: number
  /** ISO timestamp. */
  createdAt: string
  /** 'delivery' when this is an assignment to the signed-in delivery partner. */
  kind?: 'order' | 'delivery'
}

/** Sent to a delivery partner when an admin assigns them an order. */
export type DeliveryAssignment = {
  orderId: string
  orderNumber: string
  customerName: string
  dropAddress: string
  total: number
}

export type RevokeReason = 'session_replaced' | 'unauthorized'

type ServerMessage =
  | { type: 'order:created'; data: OrderNotification }
  | { type: 'delivery:assigned'; data: DeliveryAssignment }
  | { type: 'pong' }

export type RealtimeHandlers = {
  onOrderCreated: (order: OrderNotification) => void
  onDeliveryAssigned?: (assignment: DeliveryAssignment) => void
  onSessionRevoked: (reason: RevokeReason) => void
  onStatusChange?: (connected: boolean) => void
}

const HEARTBEAT_MS = 25_000
const MIN_RETRY_MS = 1_000
const MAX_RETRY_MS = 30_000

/**
 * One authenticated socket per signed-in session. Reconnects with exponential backoff,
 * except after the server revokes the session, when it stops for good.
 */
export class RealtimeConnection {
  private socket: WebSocket | null = null
  private heartbeat: ReturnType<typeof setInterval> | undefined
  private retryTimer: ReturnType<typeof setTimeout> | undefined
  private retryDelay = MIN_RETRY_MS
  private stopped = false
  private resolving = false

  constructor(
    private readonly token: string,
    private readonly handlers: RealtimeHandlers,
  ) {}

  connect() {
    if (this.stopped || this.isOpenOrConnecting() || this.resolving) return
    clearTimeout(this.retryTimer)

    // The backend URL may still be being chosen (local vs production).
    this.resolving = true
    getWsUrl()
      .then((url) => {
        this.resolving = false
        if (!this.stopped && !this.isOpenOrConnecting()) this.open(url)
      })
      .catch(() => {
        this.resolving = false
        this.scheduleReconnect()
      })
  }

  private open(url: string) {
    // Browsers can't set headers on a WebSocket, so the token goes in the query string.
    const socket = new WebSocket(`${url}?token=${encodeURIComponent(this.token)}`)
    this.socket = socket

    socket.onopen = () => {
      this.retryDelay = MIN_RETRY_MS
      this.handlers.onStatusChange?.(true)
      this.heartbeat = setInterval(() => this.send({ type: 'ping' }), HEARTBEAT_MS)
    }

    socket.onmessage = (event) => {
      const message = parse(event.data)
      if (message?.type === 'order:created') this.handlers.onOrderCreated(message.data)
      if (message?.type === 'delivery:assigned') this.handlers.onDeliveryAssigned?.(message.data)
    }

    socket.onclose = (event) => {
      if (this.socket !== socket) return
      this.cleanupSocket()
      this.handlers.onStatusChange?.(false)

      if (event.code === CloseCode.SessionReplaced) {
        this.revoke('session_replaced')
      } else if (event.code === CloseCode.Unauthorized) {
        this.revoke('unauthorized')
      } else {
        this.scheduleReconnect()
      }
    }

    // `onclose` always follows `onerror`, so reconnecting is handled there.
    socket.onerror = () => {}
  }

  /** Closes the socket and stops reconnecting. */
  disconnect() {
    this.stopped = true
    clearTimeout(this.retryTimer)
    const socket = this.socket
    this.cleanupSocket()
    socket?.close(1000, 'Client signed out')
  }

  private revoke(reason: RevokeReason) {
    if (this.stopped) return
    this.disconnect()
    this.handlers.onSessionRevoked(reason)
  }

  private scheduleReconnect() {
    if (this.stopped) return
    // Jitter keeps many clients from reconnecting in lockstep after a server restart.
    const delay = this.retryDelay * (0.75 + Math.random() * 0.5)
    this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS)
    this.retryTimer = setTimeout(() => this.connect(), delay)
  }

  private isOpenOrConnecting() {
    return this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING
  }

  private send(message: { type: 'ping' }) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message))
  }

  private cleanupSocket() {
    clearInterval(this.heartbeat)
    if (this.socket) {
      this.socket.onopen = this.socket.onmessage = this.socket.onclose = this.socket.onerror = null
    }
    this.socket = null
  }
}

function parse(data: unknown): ServerMessage | null {
  if (typeof data !== 'string') return null
  try {
    const message = JSON.parse(data)
    return message && typeof message.type === 'string' ? (message as ServerMessage) : null
  } catch {
    return null
  }
}
