import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';
import { CenteredPanel } from '@/components/CenteredPanel';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <CenteredPanel>
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <img src={logo} alt="" width={64} height={64} />
        <h1 className="text-display text-foreground">{t('auth.welcomeBack')}</h1>
        <p className="text-body text-muted-foreground">{t('appName')}</p>
      </div>
      <LoginForm />
    </CenteredPanel>
  );
}
