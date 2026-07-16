import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CenteredPanel } from '@/components/CenteredPanel';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <CenteredPanel>
      <div className="mb-7 text-center">
        <h1 className="text-display text-foreground">{t('auth.createAccount')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('auth.registerSubtitle')}</p>
      </div>
      <RegisterForm />
    </CenteredPanel>
  );
}
