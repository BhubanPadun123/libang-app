import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/store/customer-api'

type QueryStatusProps = {
  isLoading: boolean
  error?: unknown
  onRetry: () => void
}

/**
 * Spinner on first load, or the error with a retry button. Renders nothing once data is in,
 * so screens can write `<QueryStatus …/> {data && …}`.
 */
export function QueryStatus({ isLoading, error, onRetry }: QueryStatusProps) {
  const theme = useTheme()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={{ sf: 'wifi.exclamationmark', md: 'wifi_off' }}
        title="Couldn't load this"
        message={errorMessage(error)}
        action={<Button label="Try again" variant="secondary" onPress={onRetry} />}
      />
    )
  }

  return null
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
})
