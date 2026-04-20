import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/src/context/settings-context';
import { getTranslation, type TranslationKey } from '@/src/i18n/translations';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { language } = useSettings();
  const t = (key: TranslationKey) => getTranslation(language, key);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('shopTitle'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="storefront-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('wishlistTitle'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="heart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cartTitle'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="cart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('ordersTitle'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="receipt-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profileTitle'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}