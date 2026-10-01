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
    <CenteredPanel className="max-w-[480px]">
      <div className="mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-2xs transition-all hover:bg-accent hover:text-foreground active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('common.back', 'Back')}</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-title text-foreground font-bold">{t('auth.createAccount')}</h1>
          <p className="mt-1 text-body text-muted-foreground">{t('auth.registerSubtitle')}</p>
        </div>
        <RegisterForm />
      </div>
    </CenteredPanel>
  );
}
