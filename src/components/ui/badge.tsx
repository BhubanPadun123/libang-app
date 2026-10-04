import { StyleSheet, Text, View } from 'react-native'

import { useToneColors, type Tone } from '@/components/ui/icon-bubble'
import { Radius, Spacing } from '@/constants/theme'

type BadgeProps = {
  label: string
  tone?: Tone
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { bg, fg } = useToneColors(tone)
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
  },
})
