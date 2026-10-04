import { Linking } from 'react-native'

/** Opens the phone dialer. Returns false when there's no usable number. */
export function callPhone(phone?: string) {
  const digits = phone?.replace(/[^\d+]/g, '')
  if (!digits) return false
  Linking.openURL(`tel:${digits}`).catch(() => {})
  return true
}

export type Destination = { latitude?: number; longitude?: number; address?: string }

export function hasCoordinates(d: Destination): d is Destination & { latitude: number; longitude: number } {
  return typeof d.latitude === 'number' && typeof d.longitude === 'number'
}

/**
 * Turn-by-turn directions in Google Maps (the app if installed, otherwise the browser).
 * Uses the exact pin when there is one, otherwise the typed address.
 */
export function openDirections(destination: Destination) {
  const target = hasCoordinates(destination)
    ? `${destination.latitude},${destination.longitude}`
    : destination.address?.trim()
  if (!target) return false
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(target)}`
  ).catch(() => {})
  return true
}
