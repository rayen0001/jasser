import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/src/context/auth-context';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { SignupPayload } from '@/src/types/models';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState<SignupPayload & { confirmPassword: string }>({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    phone: '',
    avatar: '',
    gender: '',
  });

  const submitLabel = useMemo(() => {
    if (isLoading) {
      return 'Please wait...';
    }
    return mode === 'login' ? 'Login' : 'Create account';
  }, [isLoading, mode]);

  async function onSubmit() {
    setErrorMessage('');

    if (mode === 'login') {
      if (!loginForm.email.trim() || !loginForm.password.trim()) {
        setErrorMessage('Email and password are required.');
        return;
      }

      setIsLoading(true);
      try {
        await signIn({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });
        router.replace('/(tabs)');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (
      !signupForm.username.trim() ||
      !signupForm.firstname.trim() ||
      !signupForm.lastname.trim() ||
      !signupForm.email.trim() ||
      !signupForm.password
    ) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    if (signupForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        username: signupForm.username.trim(),
        firstname: signupForm.firstname.trim(),
        lastname: signupForm.lastname.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        birthday: signupForm.birthday || undefined,
        phone: signupForm.phone || undefined,
        avatar: signupForm.avatar || undefined,
        gender: signupForm.gender || undefined,
      });
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardShell}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
        <Text style={styles.subtitle}>Access your account to continue shopping.</Text>

        <View style={styles.switchRow}>
          <Pressable onPress={() => setMode('login')} style={[styles.switchBtn, mode === 'login' && styles.activeSwitch]}>
            <Text style={[styles.switchText, mode === 'login' && styles.activeSwitchText]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setMode('signup')} style={[styles.switchBtn, mode === 'signup' && styles.activeSwitch]}>
            <Text style={[styles.switchText, mode === 'signup' && styles.activeSwitchText]}>Sign up</Text>
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {mode === 'login' ? (
          <View style={styles.formBlock}>
            <TextInput
              placeholder="you@example.com"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              keyboardType="email-address"
              autoCapitalize="none"
              value={loginForm.email}
              onChangeText={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
            />
            <TextInput
              placeholder="Your password"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              secureTextEntry
              value={loginForm.password}
              onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
            />
          </View>
        ) : (
          <View style={styles.formBlock}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              autoCapitalize="none"
              value={signupForm.username}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, username: value }))}
            />
            <TextInput
              placeholder="First Name"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              value={signupForm.firstname}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, firstname: value }))}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              value={signupForm.lastname}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, lastname: value }))}
            />
            <TextInput
              placeholder="you@example.com"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              keyboardType="email-address"
              autoCapitalize="none"
              value={signupForm.email}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, email: value }))}
            />
            <TextInput
              placeholder="At least 6 characters"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              secureTextEntry
              value={signupForm.password}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, password: value }))}
            />
            <TextInput
              placeholder="Confirm password"
              style={styles.input}
              placeholderTextColor={colors.textSoft}
              secureTextEntry
              value={signupForm.confirmPassword}
              onChangeText={(value) => setSignupForm((prev) => ({ ...prev, confirmPassword: value }))}
            />
          </View>
        )}

        <Pressable onPress={onSubmit} style={styles.submitButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>{submitLabel}</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
  keyboardShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 4,
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeSwitch: {
    backgroundColor: colors.text,
  },
  switchText: {
    fontWeight: '600',
    color: colors.text,
  },
  activeSwitchText: {
    color: isDark ? '#000000' : '#ffffff',
  },
  formBlock: {
    gap: 10,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: colors.danger,
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  });
}