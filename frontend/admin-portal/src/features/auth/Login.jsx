import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

export function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{t('appName')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('auth.officerSignIn')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
