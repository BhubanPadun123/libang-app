import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { openDirections } from '@/utils/contact'

import type { MapPoint } from './delivery-map'

/** react-native-maps has no web support, so web shows the pin's coordinates with a directions link. */
export function DeliveryMap({ points }: { points: MapPoint[] }) {
  const theme = useTheme()
  const drop = points.find((p) => p.kind === 'drop') ?? points[0]
  if (!drop) return null

  return (
    <View style={[styles.box, { backgroundColor: theme.backgroundSelected }]}>
      <Icon sf="map.fill" md="map" size={32} color={theme.textSecondary} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        The map is shown in the mobile app. {drop.title}: {drop.latitude.toFixed(5)}, {drop.longitude.toFixed(5)}
      </ThemedText>
      <Button label="Open in Google Maps" size="sm" variant="secondary" onPress={() => openDirections(drop)} />
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  center: {
    textAlign: 'center',
  },
})
