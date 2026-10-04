import { Children, Fragment, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Card } from '@/components/ui/card'
import { Icon, type IconName } from '@/components/ui/icon'
import { IconBubble, type Tone } from '@/components/ui/icon-bubble'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ListItemProps = {
  title: string
  subtitle?: string
  icon?: IconName
  iconTone?: Tone
  /** Custom leading element, e.g. an avatar. Overrides `icon`. */
  leading?: ReactNode
  /** Text or element at the trailing edge. */
  trailing?: ReactNode
  onPress?: () => void
  /** Show a chevron (defaults to true when `onPress` is set and no trailing). */
  chevron?: boolean
}

export function ListItem({
  title,
  subtitle,
  icon,
  iconTone,
  leading,
  trailing,
  onPress,
  chevron,
}: ListItemProps) {
  const theme = useTheme()
  const showChevron = chevron ?? (!!onPress && trailing === undefined)

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {leading ?? (icon ? <IconBubble icon={icon} tone={iconTone} /> : null)}
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {typeof trailing === 'string' ? <ThemedText type="smallBold">{trailing}</ThemedText> : trailing}
      {showChevron ? (
        <Icon sf="chevron.right" md="chevron_right" size={16} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  )
}

/** Groups list items in one card with dividers between rows. */
export function ListCard({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const items = Children.toArray(children)
  return (
    <Card style={styles.listCard}>
      {items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
          {child}
        </Fragment>
      ))}
    </Card>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three,
  },
})
