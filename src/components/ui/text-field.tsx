import type { ReactNode, Ref } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon, type IconName } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type TextFieldProps = TextInputProps & {
  label: string
  icon?: IconName
  /** Element shown at the right of the input, e.g. a show/hide toggle. */
  right?: ReactNode
  ref?: Ref<TextInput>
}

export function TextField({ label, icon, right, style, ref, ...props }: TextFieldProps) {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={[styles.field, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {icon ? <Icon {...icon} size={20} color={theme.textSecondary} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, style]}
          {...props}
        />
        {right}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
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
