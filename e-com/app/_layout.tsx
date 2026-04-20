import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useMemo } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/auth-context';
import { CartProvider } from '@/src/context/cart-context';
import { SettingsProvider, useSettings } from '@/src/context/settings-context';
import { WishlistProvider } from '@/src/context/wishlist-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SettingsProvider>
            <RootNavigator />
          </SettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const systemColorScheme = useColorScheme();
  const { theme } = useSettings();

  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  const navigationTheme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colorScheme === 'dark' ? '#000000' : '#ffffff',
        card: colorScheme === 'dark' ? '#000000' : '#ffffff',
        border: colorScheme === 'dark' ? '#2a2a2a' : '#d1d5db',
        text: colorScheme === 'dark' ? '#ffffff' : '#000000',
        primary: colorScheme === 'dark' ? '#60a5fa' : '#1d4ed8',
      },
    };
  }, [colorScheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: 'Authentication' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
