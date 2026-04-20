import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authApi } from '@/src/api/auth';
import { clearSession, loadSession, saveSession } from '@/src/storage/session';
import { AuthResponse, AuthUser, LoginPayload, SignupPayload } from '@/src/types/models';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isBootstrapping: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthResponse>;
  signUp: (payload: SignupPayload) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateStoredUser: (nextUser: AuthUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadSession()
      .then((session) => {
        if (!mounted) {
          return;
        }

        setToken(session.token);
        setUser(session.user);
      })
      .finally(() => {
        if (mounted) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const commitSession = useCallback(async (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
    await saveSession(response.token, response.user);
  }, []);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      await commitSession(response);
      return response;
    },
    [commitSession]
  );

  const signUp = useCallback(
    async (payload: SignupPayload) => {
      const response = await authApi.signup(payload);
      await commitSession(response);
      return response;
    },
    [commitSession]
  );

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearSession();
  }, []);

  const updateStoredUser = useCallback(
    async (nextUser: AuthUser) => {
      if (!token) {
        return;
      }

      setUser(nextUser);
      await saveSession(token, nextUser);
    },
    [token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      signIn,
      signUp,
      signOut,
      updateStoredUser,
    }),
    [isBootstrapping, signIn, signOut, signUp, token, updateStoredUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}