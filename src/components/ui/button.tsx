import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon, type IconName } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ButtonProps = {
  label: string
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'sm'
  icon?: IconName
  loading?: boolean
  disabled?: boolean
  /** Stretch to the parent's width. */
  block?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  block,
}: ButtonProps) {
  const theme = useTheme()
  const palette = {
    primary: { bg: theme.primary, fg: theme.onPrimary },
    secondary: { bg: theme.backgroundSelected, fg: theme.text },
    ghost: { bg: 'transparent', fg: theme.primary },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: palette.bg },
        block && styles.block,
        (pressed || disabled) && styles.dimmed,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon {...icon} size={size === 'sm' ? 16 : 18} color={palette.fg} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: palette.fg }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  md: {
    minHeight: 50,
    paddingHorizontal: Spacing.four,
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
  },
  block: {
    alignSelf: 'stretch',
  },
  dimmed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 16,
    fontWeight: 700,
  },
  labelSm: {
    fontSize: 14,
  },
})
