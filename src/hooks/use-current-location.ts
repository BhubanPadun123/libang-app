import * as Location from 'expo-location'
import { useState } from 'react'

export type PinnedLocation = {
  latitude: number
  longitude: number
  /** Best-effort address for prefilling the form; any field may be missing. */
  address?: { line?: string; city?: string; state?: string; pincode?: string }
}

/** Asks for foreground location once and reads the device's position with a readable address. */
export function useCurrentLocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = async (): Promise<PinnedLocation | null> => {
    setLoading(true)
    setError(null)
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync()
      if (!granted) {
        setError('Location permission was denied. You can still type the address.')
        return null
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const pin: PinnedLocation = { latitude: coords.latitude, longitude: coords.longitude }

      // Prefilling is a convenience; the pin alone is enough for the rider.
      try {
        const [place] = await Location.reverseGeocodeAsync(coords)
        if (place) {
          pin.address = {
            line: [place.name, place.street, place.district].filter(Boolean).join(', ') || undefined,
            city: place.city ?? place.subregion ?? undefined,
            state: place.region ?? undefined,
            pincode: place.postalCode ?? undefined,
          }
        }
      } catch {
        // No readable address; keep the pin.
      }
      return pin
    } catch {
      setError("Couldn't get your location. Check that location is turned on.")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { locate, loading, error }
}
