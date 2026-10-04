import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export function SearchField(props: TextInputProps) {
  const theme = useTheme()
  return (
    <View style={[styles.field, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Icon sf="magnifyingglass" md="search" size={20} color={theme.textSecondary} />
      <TextInput
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
})
