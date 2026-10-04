import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import type { IconName } from '@/components/ui/icon'
import { IconBubble } from '@/components/ui/icon-bubble'
import { Spacing } from '@/constants/theme'

type EmptyStateProps = {
  icon: IconName
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconBubble icon={icon} size={72} />
      <ThemedText type="heading">{title}</ThemedText>
      {message ? (
        <ThemedText style={styles.message} themeColor="textSecondary">
          {message}
        </ThemedText>
      ) : null}
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
})
