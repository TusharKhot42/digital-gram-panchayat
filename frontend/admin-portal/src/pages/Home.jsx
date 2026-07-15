import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  FileText,
  Megaphone,
  BookOpen,
  Receipt,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@dgp/shared';
import { Skeleton } from '@/components/Skeleton';
import { useMetrics, useCharts, useActivity } from '@/features/dashboard/hooks';

// Charts (recharts) load on demand — keeps the heavy plotting library out of the app shell.
const DashboardCharts = lazy(() => import('@/features/dashboard/DashboardCharts'));
import { complaintService } from '@/features/complaints/complaintService';
import { certificateService } from '@/features/dakhala/certificateService';

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs transition-shadow duration-150 hover:shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        {/* The number leads; the label supports it. */}
        <p className="truncate text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="truncate text-body text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function Home() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: m } = useMetrics();
  const { data: charts } = useCharts();
  const { data: activity } = useActivity();

  const { data: recentComplaints } = useQuery({
    queryKey: ['dashboard', 'recent-complaints'],
    queryFn: () => complaintService.list({ limit: 5 }),
    refetchInterval: 30_000,
  });
  const { data: recentCerts } = useQuery({
    queryKey: ['dashboard', 'recent-certs'],
    queryFn: () => certificateService.list({ limit: 5 }),
    refetchInterval: 30_000,
  });

  const cards = [
    { icon: Users, label: t('dashboard.citizens'), value: m?.totalCitizens ?? '—' },
    {
      icon: ClipboardList,
      label: t('dashboard.pendingComplaints'),
      value: m?.pendingComplaints ?? '—',
    },
    {
      icon: CheckCircle2,
      label: t('dashboard.resolvedComplaints'),
      value: m?.resolvedComplaints ?? '—',
    },
    { icon: FileText, label: t('dashboard.certificates'), value: m?.totalCertificates ?? '—' },
    {
      icon: CheckCircle2,
      label: t('dashboard.approvedCertificates'),
      value: m?.approvedCertificates ?? '—',
    },
    { icon: Megaphone, label: t('dashboard.activeNotices'), value: m?.totalNotices ?? '—' },
    { icon: BookOpen, label: t('dashboard.schemes'), value: m?.totalSchemes ?? '—' },
    { icon: Receipt, label: t('dashboard.taxRecords'), value: m?.totalTaxRecords ?? '—' },
    {
      icon: Receipt,
      label: t('dashboard.outstandingTax'),
      value: m ? formatCurrency(m.outstandingTax, locale) : '—',
    },
  ];

  const quickActions = [
    { to: '/notices/new', label: t('dashboard.qaNotice') },
    { to: '/schemes/new', label: t('dashboard.qaScheme') },
    { to: '/tax/new', label: t('dashboard.qaTax') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickActions.map((qa) => (
          <Link
            key={qa.to}
            to={qa.to}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            {qa.label}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        }
      >
        <DashboardCharts charts={charts} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {t('dashboard.recentComplaints')}
          </h2>
          <ul className="space-y-2 text-sm">
            {(recentComplaints?.data ?? []).map((c) => (
              <li key={c.id}>
                <Link to={`/complaints/${c.id}`} className="flex justify-between gap-2">
                  <span className="truncate text-foreground">{c.title}</span>
                  <span className="shrink-0 text-muted-foreground">{c.status}</span>
                </Link>
              </li>
            ))}
            {recentComplaints?.data?.length === 0 ? (
              <li className="text-muted-foreground">{t('dashboard.none')}</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {t('dashboard.recentCertificates')}
          </h2>
          <ul className="space-y-2 text-sm">
            {(recentCerts?.data ?? []).map((a) => (
              <li key={a.id}>
                <Link to={`/dakhala/${a.id}`} className="flex justify-between gap-2">
                  <span className="truncate text-foreground">
                    {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{a.status}</span>
                </Link>
              </li>
            ))}
            {recentCerts?.data?.length === 0 ? (
              <li className="text-muted-foreground">{t('dashboard.none')}</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t('dashboard.activity')}</h2>
          <ul className="space-y-2 text-sm">
            {(activity ?? []).slice(0, 8).map((a) => (
              <li key={a.id} className="flex justify-between gap-2">
                <span className="truncate text-foreground">{a.action}</span>
                <span className="shrink-0 text-muted-foreground">{formatDate(a.at, locale)}</span>
              </li>
            ))}
            {activity?.length === 0 ? (
              <li className="text-muted-foreground">{t('dashboard.none')}</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
