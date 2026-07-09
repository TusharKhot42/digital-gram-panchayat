import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <img src={logo} alt={t('appName')} width={64} height={64} />
        <h1 className="text-xl font-semibold text-foreground">{t('auth.welcomeBack')}</h1>
        <p className="text-sm text-muted-foreground">{t('appName')}</p>
      </div>
      <LoginForm />
    </div>
  );
}
