import { useRef } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import { Radius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type MapPoint = {
  latitude: number
  longitude: number
  title: string
  description?: string
  kind: 'drop' | 'pickup'
}

/** Drop-off and pickup pins, zoomed to fit them all. */
export function DeliveryMap({ points }: { points: MapPoint[] }) {
  const theme = useTheme()
  const map = useRef<MapView>(null)
  const drop = points.find((p) => p.kind === 'drop') ?? points[0]

  if (!drop) return null

  return (
    <MapView
      ref={map}
      style={[styles.map, { borderColor: theme.border }]}
      initialRegion={{ latitude: drop.latitude, longitude: drop.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
      showsUserLocation
      showsMyLocationButton
      onMapReady={() => {
        if (points.length > 1) {
          map.current?.fitToCoordinates(points, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: false,
          })
        }
      }}>
      {points.map((p) => (
        <Marker
          key={`${p.kind}-${p.latitude}-${p.longitude}`}
          coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          title={p.title}
          description={p.description}
          pinColor={p.kind === 'drop' ? theme.primary : theme.info}
        />
      ))}
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    height: 280,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
})
