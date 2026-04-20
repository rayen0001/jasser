import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/hooks/use-app-theme';
import { useSettings, type CurrencyCode, type ThemePreference } from '@/src/context/settings-context';
import { getTranslation, type TranslationKey } from '@/src/i18n/translations';

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];
const languageOptions = ['en', 'fr'] as const;
const currencyOptions: CurrencyCode[] = ['USD', 'EUR', 'TND'];

type Styles = ReturnType<typeof createStyles>;

export default function SettingsScreen() {
  const { theme, language, currency, setTheme, setLanguage, setCurrency, loaded } = useSettings();
  const { colors } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const t = useMemo(() => (key: TranslationKey) => getTranslation(language, key), [language]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function updateSetting(action: () => Promise<void>) {
    setSaving(true);
    try {
      await action();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('settingsTitle')}</Text>
      <Text style={styles.subheading}>Make the app match your style and locale.</Text>

      {!loaded ? <ActivityIndicator color={colors.primary} /> : null}

      <Section title={t('themeLabel')} styles={styles}>
        <View style={styles.chipRow}>
          {themeOptions.map((option) => (
            <Pill
              key={option}
              label={t(`${option}Theme` as TranslationKey)}
              active={theme === option}
              onPress={() => updateSetting(() => setTheme(option))}
              disabled={saving}
              styles={styles}
            />
          ))}
        </View>
      </Section>

      <Section title={t('languageLabel')} styles={styles}>
        <View style={styles.chipRow}>
          {languageOptions.map((option) => (
            <Pill
              key={option}
              label={t(option === 'en' ? 'english' : 'french')}
              active={language === option}
              onPress={() => updateSetting(() => setLanguage(option))}
              disabled={saving}
              styles={styles}
            />
          ))}
        </View>
      </Section>

      <Section title={t('currencyLabel')} styles={styles}>
        <View style={styles.chipRow}>
          {currencyOptions.map((option) => (
            <Pill
              key={option}
              label={t(option.toLowerCase() as TranslationKey)}
              active={currency === option}
              onPress={() => updateSetting(() => setCurrency(option))}
              disabled={saving}
              styles={styles}
            />
          ))}
        </View>
      </Section>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Preview</Text>
        <Text style={styles.previewValue}>
          {language === 'fr' ? 'Bonjour' : 'Hello'} - {currency}
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: Styles;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
  disabled,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  styles: Styles;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.pill, active && styles.pillActive, disabled && styles.pillDisabled]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: 56,
      paddingHorizontal: 16,
      paddingBottom: 40,
      backgroundColor: colors.background,
      gap: 14,
    },
    heading: {
      fontSize: 30,
      fontWeight: '700',
      color: colors.text,
    },
    subheading: {
      color: colors.textMuted,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    pillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    pillDisabled: {
      opacity: 0.7,
    },
    pillText: {
      color: colors.text,
      fontWeight: '700',
    },
    pillTextActive: {
      color: colors.primary,
    },
    previewCard: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 18,
      padding: 16,
      gap: 4,
    },
    previewLabel: {
      color: colors.textSoft,
    },
    previewValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
  });
}