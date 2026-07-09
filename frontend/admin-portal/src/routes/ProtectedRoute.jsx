import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Gates the officer dashboard. Shows a loader while the persisted token is verified,
 * then redirects unauthenticated officers to /login. Real M2 session check (replaces
 * the M1 pass-through placeholder).
 */
export function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
