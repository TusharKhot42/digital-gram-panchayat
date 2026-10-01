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
import { formatCurrency, formatDate, WARD_DETAILS } from '@dgp/shared';
import officeBanner from '@dgp/shared/assets/images/hero/gram-panchayat-office.svg';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { DakhalaStatusBadge } from '@/features/dakhala/DakhalaStatusBadge';
import { useMetrics, useCharts, useActivity } from '@/features/dashboard/hooks';

// Charts (recharts) load on demand — keeps the heavy plotting library out of the app shell.
const DashboardCharts = lazy(() => import('@/features/dashboard/DashboardCharts'));
import { complaintService } from '@/features/complaints/complaintService';
import { certificateService } from '@/features/dakhala/certificateService';

const TONES = {
  brand: 'bg-primary-subtle text-primary',
  pending: 'bg-warning-subtle text-warning-strong',
  due: 'bg-destructive-subtle text-destructive-strong',
};

/**
 * One figure on the dashboard. `to` makes it a link: these numbers are an officer's work
 * queue, so "2 pending complaints" should open the pending complaints, not just report them.
 */
function MetricCard({ icon: Icon, label, value, to, tone = 'brand' }) {
  const body = (
    <>
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
          TONES[tone],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        {/* The number leads; the label supports it. */}
        <p className="truncate text-display tabular-nums text-foreground">{value}</p>
        <p className="truncate text-body text-muted-foreground">{label}</p>
      </div>
    </>
  );

  const className = cn(
    'flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs',
    'transition-[box-shadow,border-color] duration-150 hover:shadow-sm',
    to && 'hover:border-primary/40',
  );

  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** A titled band of metrics — separates "act on this" from "reference figures". */
function MetricGroup({ title, children }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-section text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
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

  /*
   * Split by what an officer has to do about it. A flat 3x3 grid of identical counters gave a
   * pending complaint the same weight as the number of registered citizens; these are not the
   * same kind of fact. Every card links to the screen where the work is done.
   */
  const actionCards = [
    {
      icon: ClipboardList,
      label: t('dashboard.pendingComplaints'),
      value: m?.pendingComplaints ?? '—',
      to: '/complaints',
      tone: m?.pendingComplaints ? 'pending' : 'brand',
    },
    {
      icon: FileText,
      label: t('dashboard.certificates'),
      value: m?.totalCertificates ?? '—',
      to: '/dakhala',
      tone: 'brand',
    },
    {
      icon: Receipt,
      label: t('dashboard.outstandingTax'),
      value: m ? formatCurrency(m.outstandingTax, locale) : '—',
      to: '/tax',
      tone: m?.outstandingTax ? 'due' : 'brand',
    },
  ];

  const recordCards = [
    { icon: Users, label: t('dashboard.citizens'), value: m?.totalCitizens ?? '—', to: '/users' },
    {
      icon: CheckCircle2,
      label: t('dashboard.resolvedComplaints'),
      value: m?.resolvedComplaints ?? '—',
      to: '/complaints',
    },
    {
      icon: CheckCircle2,
      label: t('dashboard.approvedCertificates'),
      value: m?.approvedCertificates ?? '—',
      to: '/dakhala',
    },
    {
      icon: Megaphone,
      label: t('dashboard.activeNotices'),
      value: m?.totalNotices ?? '—',
      to: '/notices',
    },
    {
      icon: BookOpen,
      label: t('dashboard.schemes'),
      value: m?.totalSchemes ?? '—',
      to: '/schemes',
    },
    {
      icon: Receipt,
      label: t('dashboard.taxRecords'),
      value: m?.totalTaxRecords ?? '—',
      to: '/tax',
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
      {/*
       * The officer's dashboard opened on a plain white page with a heading. The band grounds it
       * as the panchayat's own product rather than a generic admin template — same artwork the
       * citizen sees on the public page, so the two portals are visibly one service.
       */}
      <div className="relative isolate flex flex-wrap items-end justify-between gap-3 overflow-hidden rounded-2xl border border-border px-5 py-5">
        <img
          src={officeBanner}
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0B1E45]/70" />
        <div className="min-w-0">
          <h1 className="text-title text-white">{t('dashboard.title')}</h1>
          <p className="mt-0.5 text-caption text-white/80">{formatDate(today, locale)}</p>
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

      <MetricGroup title={t('dashboard.needsAttention')}>
        {actionCards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </MetricGroup>

      <MetricGroup title={t('dashboard.villageRecords')}>
        {recordCards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </MetricGroup>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72" />
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
                    {c.ward && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary">
                        {locale === 'mr' && WARD_DETAILS[c.ward]?.name_mr
                          ? WARD_DETAILS[c.ward].name_mr
                          : c.ward}
                      </span>
                    )}
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
                    {a.ward && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary">
                        {locale === 'mr' && WARD_DETAILS[a.ward]?.name_mr
                          ? WARD_DETAILS[a.ward].name_mr
                          : a.ward}
                      </span>
                    )}
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
