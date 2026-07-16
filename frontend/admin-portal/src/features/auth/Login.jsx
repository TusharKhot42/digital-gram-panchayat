import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

const LOGIN_URL = `${import.meta.env.VITE_CITIZEN_URL || 'http://localhost:5173'}/login`;

/**
 * There is one login page for the whole system, hosted by the citizen app. This route
 * only forwards to it: officers sign in there and are handed back to /auth/callback
 * with their token. An already-authenticated officer skips straight to the dashboard.
 */
export function Login() {
  const { isAuthenticated, ready } = useAuth();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      window.location.replace(LOGIN_URL);
    }
  }, [ready, isAuthenticated]);

  if (ready && isAuthenticated) return <Navigate to="/" replace />;
  return <LoadingScreen />;
}
