import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'

import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ChipProps = {
  label: string
  selected?: boolean
  onPress?: () => void
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : theme.backgroundElement,
          borderColor: selected ? theme.text : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color: selected ? theme.background : theme.text }]}>{label}</Text>
    </Pressable>
  )
}

type ChipGroupProps<T extends string> = {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}

/** Horizontally scrolling single-select filter. */
export function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.group}>
      {options.map((option) => (
        <Chip key={option} label={option} selected={option === value} onPress={() => onChange(option)} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.7,
  },
  group: {
    gap: Spacing.two,
  },
})
