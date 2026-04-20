import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthUser } from '@/src/types/models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export async function saveSession(token: string, user: AuthUser): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function loadSession(): Promise<{ token: string | null; user: AuthUser | null }> {
  const [[, token], [, userRaw]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
  return { token, user };
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}