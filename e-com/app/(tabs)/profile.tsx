import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { profileApi } from '@/src/api/profile';
import { useAuth } from '@/src/context/auth-context';
import { UpdateProfilePayload } from '@/src/types/models';
import { useSettings } from '@/src/context/settings-context';
import { getTranslation, TranslationKey } from '@/src/i18n/translations';
import { useAppTheme } from '@/src/hooks/use-app-theme';

const avatarStyles = ['adventurer-neutral', 'avataaars-neutral', 'bottts-neutral', 'lorelei', 'personas'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, signOut, updateStoredUser } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { language } = useSettings();
  const t = (key: TranslationKey) => getTranslation(language, key);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    username: user?.username ?? '',
    firstname: user?.firstname ?? '',
    lastname: user?.lastname ?? '',
    email: user?.email ?? '',
    birthday: user?.birthday ?? '',
    phone: user?.phone ?? '',
    gender: user?.gender ?? '',
  });

  const [avatarStyle, setAvatarStyle] = useState('adventurer-neutral');
  const [avatarSeed, setAvatarSeed] = useState('');

  const defaultAvatarSeed = useMemo(
    () => [form.username, form.firstname, form.lastname].filter(Boolean).join(' ').trim() || 'guest',
    [form.firstname, form.lastname, form.username]
  );

  const avatarUrl = useMemo(
    () =>
      `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(
        avatarSeed || defaultAvatarSeed
      )}&backgroundColor=b6e3f4,ffd5dc,c0aede,ffdfbf`,
    [avatarSeed, avatarStyle, defaultAvatarSeed]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      username: user.username || '',
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      birthday: user.birthday || '',
      phone: user.phone || '',
      gender: user.gender || '',
    });

    setAvatarStyle(extractAvatarStyle(user.avatar) ?? 'adventurer-neutral');
    setAvatarSeed(extractAvatarSeed(user.avatar) ?? '');
  }, [user]);

  useEffect(() => {
    if (!user?.id || !token) {
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setErrorMessage('');

    profileApi
      .getProfile(user.id, token)
      .then(async (response) => {
        if (!mounted) {
          return;
        }

        await updateStoredUser(response.user);
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load profile');
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token, updateStoredUser, user?.id]);

  async function saveProfile() {
    setSuccessMessage('');
    setErrorMessage('');

    if (!user || !token) {
      setErrorMessage('Please login first.');
      return;
    }

    if (!form.username.trim() || !form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
      setErrorMessage('Username, first name, last name, and email are required.');
      return;
    }

    const payload: UpdateProfilePayload = {
      username: form.username.trim(),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      birthday: form.birthday || undefined,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      avatar: avatarUrl,
    };

    setIsSaving(true);
    try {
      const response = await profileApi.updateProfile(user.id, payload, token);
      await updateStoredUser(response.user);
      setSuccessMessage('Profile saved successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  async function logout() {
    await signOut();
    router.replace('/auth');
  }

  if (!user) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.heading}>{t('profileTitle')}</Text>
        <Text style={styles.emptyText}>Sign in to manage your account profile.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth')}>
          <Text style={styles.primaryButtonText}>Go to Auth</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.heading}>{t('profileTitle')}</Text>
          <Text style={styles.subheading}>Keep your account details current.</Text>
        </View>
        <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsButtonText}>{t('goSettings')}</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <View style={styles.avatarCard}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.metaText}>Role: {user.role}</Text>
        <Text style={styles.metaText}>Created: {new Date(user.createdAt).toLocaleDateString()}</Text>
        <View style={styles.avatarButtons}>
          <Pressable onPress={() => setAvatarSeed(`${defaultAvatarSeed}-${Math.random().toString(36).slice(2, 9)}`)} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Randomize</Text>
          </Pressable>
          <Pressable onPress={() => setAvatarSeed('')} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Use Name</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor={colors.textSoft} value={form.username} onChangeText={(value) => setForm((p) => ({ ...p, username: value }))} />
        <TextInput style={styles.input} placeholder="First name" placeholderTextColor={colors.textSoft} value={form.firstname} onChangeText={(value) => setForm((p) => ({ ...p, firstname: value }))} />
        <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={colors.textSoft} value={form.lastname} onChangeText={(value) => setForm((p) => ({ ...p, lastname: value }))} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textSoft} keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(value) => setForm((p) => ({ ...p, email: value }))} />
        <TextInput style={styles.input} placeholder="Birthday (YYYY-MM-DD)" placeholderTextColor={colors.textSoft} value={form.birthday} onChangeText={(value) => setForm((p) => ({ ...p, birthday: value }))} />
        <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={colors.textSoft} keyboardType="phone-pad" value={form.phone} onChangeText={(value) => setForm((p) => ({ ...p, phone: value }))} />
        <TextInput style={styles.input} placeholder="Gender" placeholderTextColor={colors.textSoft} value={form.gender} onChangeText={(value) => setForm((p) => ({ ...p, gender: value }))} />
      </View>

      <Text style={styles.sectionLabel}>Avatar style</Text>
      <View style={styles.styleWrap}>
        {avatarStyles.map((style) => (
          <Pressable
            key={style}
            onPress={() => setAvatarStyle(style)}
            style={[styles.styleChip, avatarStyle === style && styles.styleChipActive]}>
            <Text style={[styles.styleChipText, avatarStyle === style && styles.styleChipTextActive]}>{style}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={saveProfile} style={styles.primaryButton} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Profile</Text>}
      </Pressable>

      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>{t('logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function extractAvatarStyle(avatar?: string): string | null {
  if (!avatar) {
    return null;
  }

  try {
    const url = new URL(avatar);
    const match = url.pathname.match(/\/9\.x\/([^/]+)\/svg/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractAvatarSeed(avatar?: string): string | null {
  if (!avatar) {
    return null;
  }

  try {
    const url = new URL(avatar);
    return url.searchParams.get('seed');
  } catch {
    return null;
  }
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 120,
    backgroundColor: colors.background,
    gap: 12,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  subheading: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  settingsButton: {
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 2,
  },
  settingsButtonText: {
    color: isDark ? '#000' : '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
  },
  successText: {
    color: colors.success,
  },
  avatarCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'center',
  },
  metaText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 10,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  sectionLabel: {
    fontWeight: '700',
    color: colors.text,
  },
  styleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  styleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  styleChipText: {
    color: colors.text,
    fontSize: 12,
  },
  styleChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: isDark ? '#3a1118' : '#fff1f2',
  },
  logoutButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  });
}