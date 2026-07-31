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
import { StatusBadge } from '@/components/StatusBadge';
import { DakhalaStatusBadge } from '@/features/dakhala/DakhalaStatusBadge';
import { useMetrics, useCharts, useActivity } from '@/features/dashboard/hooks';

// Charts (recharts) load on demand — keeps the heavy plotting library out of the app shell.
const DashboardCharts = lazy(() => import('@/features/dashboard/DashboardCharts'));
import { complaintService } from '@/features/complaints/complaintService';
import { certificateService } from '@/features/dakhala/certificateService';

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs transition-shadow duration-150 hover:shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        {/* The number leads; the label supports it. */}
        <p className="truncate text-display tabular-nums text-foreground">{value}</p>
        <p className="truncate text-body text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/**
 * One of the three "what happened lately" columns.
 *
 * `min-w-0` is required: a grid item's default `min-width: auto` sized this column to its
 * widest row (341px inside a 288px grid at a 320px viewport), so the row truncation below
 * never engaged and the dashboard scrolled sideways.
 */
function PanelCard({ title, children }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-card shadow-xs">
      <h2 className="border-b border-border px-4 py-3 text-section text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function PanelEmpty({ label }) {
  return <p className="px-4 py-6 text-center text-body text-muted-foreground">{label}</p>;
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

  const today = new Date();
  const complaints = recentComplaints?.data ?? [];
  const certs = recentCerts?.data ?? [];
  const events = activity ?? [];

  return (
    <div className="space-y-6">
      {/*
       * The dashboard had no <h1> of its own — it borrowed the one the header used to render,
       * so once that (permanently mislabelled) heading went, the page had no title at all.
       */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">{t('dashboard.title')}</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">{formatDate(today, locale)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <Link
              key={qa.to}
              to={qa.to}
              className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border bg-card px-3 text-body font-medium text-foreground shadow-xs transition-[background-color,box-shadow] duration-150 hover:bg-accent hover:shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {qa.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} />
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
        <PanelCard title={t('dashboard.recentComplaints')}>
          {complaints.length ? (
            <ul className="divide-y divide-border">
              {complaints.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/complaints/${c.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <span className="min-w-0 flex-1 truncate text-body text-foreground">
                      {c.title}
                    </span>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <PanelEmpty label={t('dashboard.none')} />
          )}
        </PanelCard>

        <PanelCard title={t('dashboard.recentCertificates')}>
          {certs.length ? (
            <ul className="divide-y divide-border">
              {certs.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/dakhala/${a.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <span className="min-w-0 flex-1 truncate text-body text-foreground">
                      {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
                    </span>
                    <DakhalaStatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <PanelEmpty label={t('dashboard.none')} />
          )}
        </PanelCard>

        <PanelCard title={t('dashboard.activity')}>
          {events.length ? (
            <ul className="divide-y divide-border">
              {events.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-baseline gap-2 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-body text-foreground">
                    {a.action}
                  </span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {formatDate(a.at, locale)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <PanelEmpty label={t('dashboard.none')} />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
