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
  ChevronRight,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@dgp/shared';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/PageHeader';
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

/**
 * A number the citizen should act on. `tone` colours only the icon disc — the value stays
 * in foreground text so outstanding dues don't render in a red that reads as an error.
 */
function StatCard({ icon: Icon, value, label, to, tone = 'brand' }) {
  const discClass = {
    brand: 'bg-primary-subtle text-primary',
    pending: 'bg-warning-subtle text-warning-strong',
    due: 'bg-destructive-subtle text-destructive-strong',
  }[tone];

  return (
    <Link
      to={to}
      className="group rounded-lg border border-border bg-card p-3 shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${discClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-title tabular-nums text-foreground">{value}</p>
          <p className="truncate text-caption text-muted-foreground">{label}</p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
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

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <div className="dgp-page">
      <header className="mb-5">
        <h1 className="text-title text-foreground">
          {t('home.welcome')}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-body text-muted-foreground">{t('home.pickService')}</p>
      </header>

      {/* At-a-glance: what needs the citizen's attention today. */}
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          icon={ClipboardList}
          value={activeComplaints}
          label={t('home.activeComplaints')}
          to="/complaints"
        />
        <StatCard
          icon={Clock}
          value={pendingCerts}
          label={t('home.pendingCertificates')}
          to="/dakhala"
          tone="pending"
        />
        <StatCard
          icon={AlertCircle}
          value={formatCurrency(outstanding, locale)}
          label={t('home.outstandingDues')}
          to="/tax"
          tone={outstanding > 0 ? 'due' : 'brand'}
        />
      </div>

      <section className="mt-8">
        <SectionHeader title={t('home.services')} />
        <div className="grid grid-cols-3 gap-3">
          {services.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 text-center shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <span className="text-caption font-medium leading-tight text-foreground">
                {t(label)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {latestNotices.length ? (
        <section className="mt-8">
          <SectionHeader
            title={t('home.latestNotices')}
            action={
              <Link
                to="/notices"
                className="rounded-md px-1 py-0.5 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                {t('home.seeAll')}
              </Link>
            }
          />
          <Card>
            <ul className="divide-y divide-border">
              {latestNotices.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/notices/${n.id}`}
                    className="flex min-h-11 items-center gap-2 px-3 py-2.5 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <Megaphone
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-body text-foreground">
                      {n.title}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}

      {latestSchemes.length ? (
        <section className="mt-8">
          <SectionHeader
            title={t('home.latestSchemes')}
            action={
              <Link
                to="/schemes"
                className="rounded-md px-1 py-0.5 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                {t('home.seeAll')}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3">
            {latestSchemes.map((s) => (
              <Link
                key={s.id}
                to={`/schemes/${s.id}`}
                className="flex min-h-16 items-start rounded-lg border border-border bg-card p-3 shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
              >
                <span className="line-clamp-2 text-body font-medium text-foreground">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
