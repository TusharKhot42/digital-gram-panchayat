import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Guards citizen-only routes. While the persisted token is being verified we show a
 * loader; once ready, unauthenticated users are redirected to /login (remembering
 * where they were headed).
 */
export function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
