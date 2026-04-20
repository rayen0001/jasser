import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/src/context/settings-context';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { theme, language, currency } = useSettings();

  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  return useMemo(() => {
    const isDark = colorScheme === 'dark';

    return {
      colorScheme,
      isDark,
      language,
      currency,
      colors: {
        background: isDark ? '#000000' : '#ffffff',
        surface: isDark ? '#000000' : '#ffffff',
        surfaceAlt: isDark ? '#111111' : '#f3f4f6',
        surfaceMuted: isDark ? '#1f1f1f' : '#e5e7eb',
        text: isDark ? '#ffffff' : '#000000',
        textMuted: isDark ? '#f3f4f6' : '#374151',
        textSoft: isDark ? '#d1d5db' : '#4b5563',
        border: isDark ? '#2a2a2a' : '#d1d5db',
        primary: isDark ? '#60a5fa' : '#1d4ed8',
        primarySoft: isDark ? '#1e40af' : '#dbeafe',
        danger: '#dc2626',
        success: '#0f766e',
      },
    };
  }, [colorScheme, currency, language]);
}