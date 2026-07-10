import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Megaphone,
  Landmark,
  FileText,
  Receipt,
  User,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@dgp/shared';
import { useAuth } from '@/hooks/useAuth';
import { useMyComplaints } from '@/features/complaints/hooks';
import { useMyApplications } from '@/features/dakhala/hooks';
import { useMyTax } from '@/features/tax/hooks';
import { useNotices } from '@/features/notices/hooks';
import { useSchemes } from '@/features/schemes/hooks';

const services = [
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
  { to: '/notices', label: 'nav.notices', icon: Megaphone },
  { to: '/schemes', label: 'nav.schemes', icon: Landmark },
  { to: '/tax', label: 'nav.tax', icon: Receipt },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
  { to: '/profile', label: 'nav.profile', icon: User },
];

function StatPill({ icon: Icon, value, label, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-lg font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

export function Home() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { user } = useAuth();

  const { data: complaints } = useMyComplaints();
  const { data: applications } = useMyApplications();
  const { data: tax } = useMyTax();
  const { data: notices } = useNotices();
  const { data: schemes } = useSchemes();

  const activeComplaints = (complaints?.data ?? []).filter((c) => c.status !== 'Resolved').length;
  const pendingCerts = (applications?.data ?? []).filter(
    (a) => a.status === 'Submitted' || a.status === 'UnderReview',
  ).length;
  const outstanding = tax?.totalDues ?? 0;
  const latestNotices = (notices?.data ?? []).slice(0, 3);
  const latestSchemes = (schemes?.data ?? []).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="text-lg font-semibold text-foreground">
        {t('home.welcome')}
        {user?.fullName ? `, ${user.fullName}` : ''}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('home.pickService')}</p>

      {/* Personal summary */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <StatPill
          icon={ClipboardList}
          value={activeComplaints}
          label={t('home.activeComplaints')}
          to="/complaints"
        />
        <StatPill
          icon={Clock}
          value={pendingCerts}
          label={t('home.pendingCertificates')}
          to="/dakhala"
        />
        <StatPill
          icon={AlertCircle}
          value={formatCurrency(outstanding, locale)}
          label={t('home.outstandingDues')}
          to="/tax"
        />
      </div>

      {/* Service grid */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {services.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
          >
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t(label)}</span>
          </Link>
        ))}
      </div>

      {/* Latest notices */}
      {latestNotices.length ? (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t('home.latestNotices')}</h2>
            <Link to="/notices" className="text-xs text-primary">
              {t('home.seeAll')}
            </Link>
          </div>
          <ul className="space-y-2">
            {latestNotices.map((n) => (
              <li key={n.id}>
                <Link
                  to={`/notices/${n.id}`}
                  className="block truncate rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Latest schemes */}
      {latestSchemes.length ? (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t('home.latestSchemes')}</h2>
            <Link to="/schemes" className="text-xs text-primary">
              {t('home.seeAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {latestSchemes.map((s) => (
              <Link
                key={s.id}
                to={`/schemes/${s.id}`}
                className="rounded-md border border-border bg-card p-3 text-sm font-medium text-foreground"
              >
                <span className="line-clamp-2">{s.title}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
