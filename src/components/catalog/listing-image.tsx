import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { Icon, type IconName } from '@/components/ui/icon'
import { Radius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import type { ListingType } from '@/types/catalog'

export const ListingIcon: Record<ListingType | 'STORE' | 'RESTAURANT', IconName> = {
  FOOD: { sf: 'fork.knife', md: 'restaurant' },
  PRODUCT: { sf: 'shippingbox.fill', md: 'inventory_2' },
  ROOM: { sf: 'bed.double.fill', md: 'hotel' },
  STORE: { sf: 'storefront.fill', md: 'storefront' },
  RESTAURANT: { sf: 'fork.knife', md: 'restaurant' },
}

type ListingImageProps = {
  uri?: string
  /** Shown when there's no image or it fails to load. */
  fallback: IconName
  style?: StyleProp<ViewStyle>
}

/** Owner-supplied photo with an icon placeholder, since many listings have no image yet. */
export function ListingImage({ uri, fallback, style }: ListingImageProps) {
  const theme = useTheme()
  const [failed, setFailed] = useState(false)

  return (
    <View style={[styles.frame, { backgroundColor: theme.backgroundSelected }, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Icon {...fallback} size={28} color={theme.textSecondary} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
