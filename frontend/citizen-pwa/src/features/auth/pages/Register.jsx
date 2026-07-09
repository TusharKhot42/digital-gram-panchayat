import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">{t('auth.createAccount')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>
      </div>
      <RegisterForm />
    </div>
  );
}
