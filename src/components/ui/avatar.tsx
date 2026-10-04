import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/use-theme'

type AvatarProps = {
  name: string
  size?: number
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  const theme = useTheme()
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primarySoft },
      ]}>
      <Text style={[styles.text, { color: theme.primary, fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 700,
  },
})
