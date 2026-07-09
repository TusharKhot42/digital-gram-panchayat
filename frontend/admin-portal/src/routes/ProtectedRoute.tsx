import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Route gate placeholder. Milestone 2 wires the real session check (AuthContext + JWT)
 * here; until then it renders children unconditionally so the routing structure — and
 * every later route that needs gating — already exists.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
