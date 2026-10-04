import { StyleSheet, View } from 'react-native'

import { Icon, type IconName } from '@/components/ui/icon'
import { Radius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type IconBubbleProps = {
  icon: IconName
  tone?: Tone
  size?: number
}

/** Icon on a soft tinted square — used for list rows, stats, and categories. */
export function IconBubble({ icon, tone = 'primary', size = 40 }: IconBubbleProps) {
  const { bg, fg } = useToneColors(tone)
  return (
    <View style={[styles.bubble, { width: size, height: size, backgroundColor: bg }]}>
      <Icon {...icon} size={size * 0.5} color={fg} />
    </View>
  )
}

export function useToneColors(tone: Tone) {
  const theme = useTheme()
  switch (tone) {
    case 'primary':
      return { bg: theme.primarySoft, fg: theme.primary }
    case 'success':
      return { bg: theme.successSoft, fg: theme.success }
    case 'warning':
      return { bg: theme.warningSoft, fg: theme.warning }
    case 'danger':
      return { bg: theme.dangerSoft, fg: theme.danger }
    case 'info':
      return { bg: theme.infoSoft, fg: theme.info }
    case 'neutral':
      return { bg: theme.backgroundSelected, fg: theme.textSecondary }
  }
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
