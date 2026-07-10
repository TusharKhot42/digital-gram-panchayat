import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Megaphone, Landmark, FileText, Receipt, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const services = [
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList, live: true },
  { to: '/notices', label: 'nav.notices', icon: Megaphone, live: true },
  { to: '/schemes', label: 'nav.schemes', icon: Landmark, live: true },
  { to: '/tax', label: 'nav.tax', icon: Receipt, live: true },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText, live: true },
  { to: '/profile', label: 'nav.profile', icon: User, live: true },
];

export function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="text-lg font-semibold text-foreground">
        {t('home.welcome')}
        {user?.fullName ? `, ${user.fullName}` : ''}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('home.pickService')}</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {services.map(({ to, label, icon: Icon, live }) =>
          live ? (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-foreground">{t(label)}</span>
            </Link>
          ) : (
            <div
              key={to}
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4 text-center opacity-60"
            >
              <Icon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{t(label)}</span>
              <span className="text-[10px] text-muted-foreground">{t('home.soon')}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
