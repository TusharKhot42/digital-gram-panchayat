import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { CenteredPanel } from '@/components/CenteredPanel';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <CenteredPanel>
      <Link
        to="/login"
        className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-2xs transition-all hover:bg-accent hover:text-foreground active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t('common.back', 'Back')}</span>
      </Link>
      <div className="mb-7 text-center">
        <h1 className="text-display text-foreground">{t('auth.createAccount')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('auth.registerSubtitle')}</p>
      </div>
      <RegisterForm />
    </CenteredPanel>
  );
}
