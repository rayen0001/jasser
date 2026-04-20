import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (host ? `http://${host}:3000/api` : 'http://localhost:3000/api');

export const FILES_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');