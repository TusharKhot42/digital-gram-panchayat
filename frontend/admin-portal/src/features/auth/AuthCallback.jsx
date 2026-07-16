import { useEffect } from 'react';
import { ADMIN_TOKEN_STORAGE_KEY } from '@dgp/shared';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Landing point for the shared login page's officer hand-off. The citizen-app login
 * authenticates and, for officers, redirects here with the JWT in the URL fragment
 * (fragments never leave the browser). Store it, scrub the URL, and reload into the
 * dashboard — AuthProvider verifies the token against /admin/profile on boot, so a
 * forged or citizen token is rejected there and the session is cleared.
 */
export function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    }
    // Full reload (not SPA navigation) so AuthProvider boots with the new token.
    window.location.replace('/');
  }, []);

  return <LoadingScreen />;
}
