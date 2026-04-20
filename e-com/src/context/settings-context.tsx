import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { LanguageCode } from '@/src/i18n/translations';

export type ThemePreference = 'system' | 'light' | 'dark';
export type CurrencyCode = 'USD' | 'EUR' | 'TND';

type SettingsState = {
  theme: ThemePreference;
  language: LanguageCode;
  currency: CurrencyCode;
};

type SettingsContextValue = SettingsState & {
  loaded: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setLanguage: (language: LanguageCode) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
};

const SETTINGS_KEY = 'app_settings';

const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SettingsState>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (!mounted || !raw) {
          return;
        }

        try {
          const parsed = JSON.parse(raw) as Partial<SettingsState>;
          setState({
            theme: parsed.theme ?? defaultSettings.theme,
            language: parsed.language ?? defaultSettings.language,
            currency: parsed.currency ?? defaultSettings.currency,
          });
        } catch {
          setState(defaultSettings);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextState: SettingsState) => {
    setState(nextState);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextState));
  }, []);

  const setTheme = useCallback(
    async (theme: ThemePreference) => {
      const nextState = { ...state, theme };
      await persist(nextState);
    },
    [persist, state]
  );

  const setLanguage = useCallback(
    async (language: LanguageCode) => {
      const nextState = { ...state, language };
      await persist(nextState);
    },
    [persist, state]
  );

  const setCurrency = useCallback(
    async (currency: CurrencyCode) => {
      const nextState = { ...state, currency };
      await persist(nextState);
    },
    [persist, state]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...state,
      loaded,
      setTheme,
      setLanguage,
      setCurrency,
    }),
    [loaded, setCurrency, setLanguage, setTheme, state]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}