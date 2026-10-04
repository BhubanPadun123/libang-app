import { SymbolView } from 'expo-symbols'
import type { AndroidSymbol } from 'expo-symbols'
import type { ColorValue } from 'react-native'
import type { SFSymbol } from 'sf-symbols-typescript'

import { useTheme } from '@/hooks/use-theme'

export type IconName = {
  /** SF Symbol (iOS) */
  sf: SFSymbol
  /** Material Symbol (Android + web) */
  md: AndroidSymbol
}

type IconProps = IconName & {
  size?: number
  color?: ColorValue
}

export function Icon({ sf, md, size = 22, color }: IconProps) {
  const theme = useTheme()
  return (
    <SymbolView name={{ ios: sf, android: md, web: md }} size={size} tintColor={color ?? theme.text} />
  )
}
