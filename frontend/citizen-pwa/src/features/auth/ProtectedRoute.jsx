import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Guards citizen-only routes. While the persisted token is being verified we show a
 * loader; once ready, unauthenticated visitors are sent to the public village landing
 * (`/welcome`) rather than straight to the login form — the app now opens on the public
 * home page. The intended destination is remembered so login can return there.
 */
export function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
