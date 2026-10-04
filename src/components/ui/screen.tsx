import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ScreenProps = {
  title?: string
  subtitle?: string
  /** Element shown at the right of the header, e.g. an avatar or icon button. */
  headerRight?: ReactNode
  children: ReactNode
}

/** Standard scrollable page with a large title header, safe-area and tab-bar insets. */
export function Screen({ title, subtitle, headerRight, children }: ScreenProps) {
  const theme = useTheme()

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {title || headerRight ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {subtitle ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {subtitle}
                  </ThemedText>
                ) : null}
                {title ? <ThemedText style={styles.title}>{title}</ThemedText> : null}
              </View>
              {headerRight}
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
    letterSpacing: -0.5,
  },
})
