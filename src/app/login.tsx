import { router, useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconBubble } from '@/components/ui/icon-bubble'
import { Screen } from '@/components/ui/screen'
import { TextField } from '@/components/ui/text-field'
import { RoleMeta } from '@/constants/role-meta'
import { ROLES, RoleHome, RoleLabels, type Role } from '@/constants/roles'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { login } from '@/services/auth-service'
import { useAppDispatch } from '@/store/hooks'
import { signIn } from '@/store/slices/auth-slice'

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

export default function LoginScreen() {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams<{ role?: string; email?: string; registered?: string }>()
  const selectedRole = isRole(params.role) ? params.role : 'customer'
  const meta = RoleMeta[selectedRole]

  const passwordRef = useRef<TextInput>(null)
  // Prefilled when arriving straight from sign-up.
  const [email, setEmail] = useState(params.email ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const justRegistered = params.registered === '1'

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const session = await login(email, password)
      dispatch(signIn(session))
      // The backend decides the role, so route by the account's role rather than the picked one.
      router.replace(RoleHome[session.user.role])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/sign-in'))

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.back}>
        <Icon sf="chevron.left" md="arrow_back" size={22} color={theme.text} />
        <ThemedText type="smallBold">Change account type</ThemedText>
      </Pressable>

      <View style={styles.hero}>
        <IconBubble icon={meta.icon} tone={meta.tone} size={64} />
        <ThemedText type="small" themeColor="textSecondary">
          {RoleLabels[selectedRole].toUpperCase()}
        </ThemedText>
        <ThemedText style={styles.title}>Sign in to your account</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {meta.description}
        </ThemedText>
      </View>

      <Card style={styles.form}>
        {justRegistered && !error ? (
          <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: theme.successSoft }]}>
            <Icon sf="checkmark.circle.fill" md="check_circle" size={18} color={theme.success} />
            <ThemedText type="small" style={[styles.bannerText, { color: theme.success }]}>
              Account created! Sign in to continue.
            </ThemedText>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.banner, { backgroundColor: theme.dangerSoft }]}>
            <Icon sf="exclamationmark.triangle.fill" md="error" size={18} color={theme.danger} />
            <ThemedText type="small" style={[styles.bannerText, { color: theme.danger }]}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <TextField
          label="Email address"
          icon={{ sf: 'envelope.fill', md: 'mail' }}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />

        <TextField
          ref={passwordRef}
          label="Password"
          icon={{ sf: 'lock.fill', md: 'lock' }}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!loading}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}>
              <Icon
                sf={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                md={showPassword ? 'visibility_off' : 'visibility'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          }
        />

        <Button label="Sign in" onPress={handleSubmit} loading={loading} disabled={!canSubmit} block />
      </Card>

      {/* Only customers can sign up themselves; every other account is created by an admin. */}
      {selectedRole === 'customer' ? (
        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary">
            New to LibangExpress?
          </ThemedText>
          <Pressable accessibilityRole="link" onPress={() => router.push('/register')} hitSlop={8}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              Create an account
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 800,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  bannerText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
})
