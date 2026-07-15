import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

export function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-title text-foreground">{t('appName')}</h1>
            <p className="mt-1 text-body text-muted-foreground">{t('auth.officerSignIn')}</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
