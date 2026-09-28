import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Landmark, ArrowLeft } from 'lucide-react';
import logo from '@dgp/shared/assets/logo.svg';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

const TABS = [
  { key: 'villager', icon: User, labelKey: 'auth.tabVillager' },
  { key: 'officer', icon: Landmark, labelKey: 'auth.tabOfficer' },
];

/**
 * The shared sign-in page, styled like a banking/government portal: masthead, then a
 * segmented Villager / Officer selector above one card.
 */
export function Login() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState('villager');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const officer = mode === 'officer';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center px-4 py-6">
      {/* Top Action Bar */}
      <div className="flex w-full items-center justify-between mb-8 rounded-2xl border border-[#6495ED]/40 bg-[#1E3A8A] px-5 py-3 text-white shadow-md">
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#93C5FD] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('directory.home', 'Back to Public Portal')}</span>
        </Link>
      </div>

      {/* Sign-in card container */}
      <div className="mb-12 flex w-full max-w-[500px] flex-col justify-center">
        {/* Masthead */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img src={logo} alt="" width={64} height={64} />
          <h1 className="text-title text-foreground">{t('appName')}</h1>
          <p className="text-body text-muted-foreground">{t('auth.subtitle')}</p>
        </div>

        {/* Segmented mode selector — UI only, no navigation, no extra API. */}
        <div
          role="tablist"
          aria-label={t('auth.login')}
          className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1"
        >
          {TABS.map(({ key, icon: Icon, labelKey }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`login-tab-${key}`}
                aria-selected={active}
                aria-controls="login-panel"
                onClick={() => setMode(key)}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-body font-medium transition-[background-color,color,box-shadow] duration-200',
                  active
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        {/* One card, one form. Mode swaps copy/accents only; values persist. */}
        <div
          role="tabpanel"
          id="login-panel"
          aria-labelledby={`login-tab-${mode}`}
          className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          {/* Mode illustration — Lucide only, in the mode's accent. */}
          <div
            key={`illus-${mode}`}
            className="mb-5 flex animate-in justify-center duration-200 fade-in"
          >
            <span
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full',
                officer ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info',
              )}
            >
              {officer ? (
                <Landmark className="h-8 w-8" aria-hidden="true" />
              ) : (
                <User className="h-8 w-8" aria-hidden="true" />
              )}
            </span>
          </div>

          <LoginForm mode={mode} />
        </div>
      </div>
    </div>
  );
}
