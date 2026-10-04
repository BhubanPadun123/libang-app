import { Switch, type SwitchProps } from 'react-native'

import { useTheme } from '@/hooks/use-theme'

/** Brand-colored switch. */
export function Toggle(props: SwitchProps) {
  const theme = useTheme()
  return (
    <Switch
      trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={theme.backgroundSelected}
      {...props}
    />
  )
}
