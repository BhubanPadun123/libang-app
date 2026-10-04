import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Spacing } from '@/constants/theme'

type SectionProps = {
  title: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="heading" style={styles.title}>
          {title}
        </ThemedText>
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="primary">
              {actionLabel}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
  },
})
