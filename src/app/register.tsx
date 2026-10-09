import { router } from 'expo-router'
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
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { register } from '@/services/auth-service'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

type Form = {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

/** The first problem with the form, or null when it can be sent. */
function validate(form: Form): string | null {
  if (form.name.trim().length < 2) return 'Please enter your full name.'
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'Please enter a valid email address.'
  if (!/^\d{10}$/.test(form.phone.trim())) return 'Please enter a 10-digit phone number.'
  if (form.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (form.password !== form.confirmPassword) return 'Passwords do not match.'
  return null
}

/** Public sign-up. Every account made here is a customer; other roles are created by an admin. */
export default function RegisterScreen() {
  const theme = useTheme()
  const meta = RoleMeta.customer

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof Form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const canSubmit =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    const problem = validate(form)
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    setLoading(true)
    try {
      await register(form)
      router.replace({
        pathname: '/login',
        params: { role: 'customer', email: form.email.trim(), registered: '1' },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const goToLogin = () => router.replace({ pathname: '/login', params: { role: 'customer' } })
  const goBack = () => (router.canGoBack() ? router.back() : goToLogin())

  const passwordToggle = (
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
  )

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.back}>
        <Icon sf="chevron.left" md="arrow_back" size={22} color={theme.text} />
        <ThemedText type="smallBold">Back</ThemedText>
      </Pressable>

      <View style={styles.hero}>
        <IconBubble icon={meta.icon} tone={meta.tone} size={64} />
        <ThemedText style={styles.title}>Create your account</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Sign up as a customer to order food, groceries and book rooms.
        </ThemedText>
      </View>

      <Card style={styles.form}>
        {error ? (
          <View accessibilityRole="alert" style={[styles.error, { backgroundColor: theme.dangerSoft }]}>
            <Icon sf="exclamationmark.triangle.fill" md="error" size={18} color={theme.danger} />
            <ThemedText type="small" style={[styles.errorText, { color: theme.danger }]}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <TextField
          label="Full name"
          icon={{ sf: 'person.fill', md: 'person' }}
          placeholder="John Doe"
          value={form.name}
          onChangeText={update('name')}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!loading}
        />

        <TextField
          ref={emailRef}
          label="Email address"
          icon={{ sf: 'envelope.fill', md: 'mail' }}
          placeholder="you@example.com"
          value={form.email}
          onChangeText={update('email')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          editable={!loading}
        />

        <TextField
          ref={phoneRef}
          label="Phone number"
          icon={{ sf: 'phone.fill', md: 'call' }}
          placeholder="9876543210"
          value={form.phone}
          onChangeText={(value) => update('phone')(value.replace(/\D/g, '').slice(0, 10))}
          autoComplete="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          maxLength={10}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />

        <TextField
          ref={passwordRef}
          label="Password"
          icon={{ sf: 'lock.fill', md: 'lock' }}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={form.password}
          onChangeText={update('password')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
          right={passwordToggle}
        />

        <TextField
          ref={confirmRef}
          label="Confirm password"
          icon={{ sf: 'lock.fill', md: 'lock' }}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChangeText={update('confirmPassword')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!loading}
        />

        <Button label="Create account" onPress={handleSubmit} loading={loading} disabled={!canSubmit} block />
      </Card>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Already have an account?
        </ThemedText>
        <Pressable accessibilityRole="link" onPress={goToLogin} hitSlop={8}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            Sign in
          </ThemedText>
        </Pressable>
      </View>
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
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  errorText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
})
