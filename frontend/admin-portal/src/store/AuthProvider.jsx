import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ADMIN_TOKEN_STORAGE_KEY, ADMIN_USER_STORAGE_KEY } from '@dgp/shared';
import { authService } from '@/features/auth/authService';

const AuthContext = createContext(undefined);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY));
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  }, []);

  // Validate persisted token on boot.
  useEffect(() => {
    let active = true;
    async function verify() {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const fresh = await authService.getProfile();
        if (active) {
          setUser(fresh);
          localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(fresh));
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setReady(true);
      }
    }
    verify();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { user: u, token: t } = await authService.login(credentials);
    setUser(u);
    setToken(t);
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, t);
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(u));
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
