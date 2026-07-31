import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Megaphone,
  Landmark,
  FileText,
  Receipt,
  User,
  Users,
  ShieldAlert,
  AlertCircle,
  ChevronRight,
  Clock,
  CalendarDays,
  MapPin,
  Bell,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@dgp/shared';
import { Card } from '@/components/ui/card';
import { SafeImage } from '@/components/SafeImage';
import { SectionHeader } from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useMyComplaints } from '@/features/complaints/hooks';
import { useMyApplications } from '@/features/dakhala/hooks';
import { useMyTax } from '@/features/tax/hooks';
import { useNotices } from '@/features/notices/hooks';
import { useSchemes } from '@/features/schemes/hooks';
import { useVillageProfile, useVillageEvents } from '@/features/village/hooks';
import { sortMembers } from '@/features/village/members';
import { OfficialCard } from '@/features/village/OfficialCard';
import { useUnreadCount } from '@/features/notifications/hooks';

// Quick services — Directory and Emergency now sit alongside the core modules. Emergency
// scrolls to the contacts block on this page; the rest route to their module.
const SERVICES = [
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
  { to: '/tax', label: 'nav.tax', icon: Receipt },
  { to: '/schemes', label: 'nav.schemes', icon: Landmark },
  { to: '/notices', label: 'nav.notices', icon: Megaphone },
  { to: '/directory', label: 'nav.directory', icon: Users },
  { to: '#emergency', label: 'nav.emergency', icon: ShieldAlert },
  { to: '/profile', label: 'nav.profile', icon: User },
];

/** Whole days from today (midnight) to a date — 0 today, 1 tomorrow, negative if past. */
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function countdownLabel(dateStr, t) {
  const days = daysUntil(dateStr);
  if (days <= 0) return t('home.eventToday');
  if (days === 1) return t('home.eventTomorrow');
  return t('home.eventInDays', { count: days });
}

/**
 * Hero card for the next Gram Panchayat event — the visual anchor of the dashboard. The event
 * banner (or a government blue→indigo gradient when none) sits behind a legible scrim, with a
 * countdown, date and venue. Falls back to a warm empty state when nothing is scheduled.
 */
function EventHero({ event, locale, t }) {
  if (!event) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <CalendarDays className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-section text-foreground">{t('home.noEvents')}</p>
        <p className="max-w-sm text-body text-muted-foreground">{t('home.noEventsHint')}</p>
      </Card>
    );
  }

  return (
    <section
      aria-label={t('home.upcomingEvents')}
      className="relative isolate overflow-hidden rounded-2xl border border-border shadow-sm"
    >
      {event.banner ? (
        <SafeImage
          src={event.banner}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : null}
      {/* Gradient scrim: doubles as the background when there's no banner and as a legibility
          wash over one when there is. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-indigo-900/95" />
      <div className="absolute inset-0 -z-10 bg-foreground/25" />

      <div className="flex min-h-[13rem] flex-col justify-end gap-3 p-5 text-primary-foreground sm:min-h-[15rem] sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-caption font-medium backdrop-blur">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {t('home.upcomingEvents')}
          </span>
          <span className="rounded-full bg-white/95 px-3 py-1 text-caption font-semibold text-primary">
            {countdownLabel(event.startDate, t)}
          </span>
        </div>
        <h2 className="text-display font-semibold leading-tight">{event.title}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body opacity-95">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatDate(event.startDate, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatTime(event.startDate, locale)}
          </span>
          {event.location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          ) : null}
          {event.organizer ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.organizer}</span>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Compact status figure the citizen should act on. */
function StatCard({ icon: Icon, value, label, to, tone = 'brand' }) {
  const disc = {
    brand: 'bg-primary-subtle text-primary',
    pending: 'bg-warning-subtle text-warning-strong',
    due: 'bg-destructive-subtle text-destructive-strong',
    info: 'bg-primary-subtle text-primary',
  }[tone];
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-card p-3.5 shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${disc}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-2.5 text-title tabular-nums text-foreground">{value}</p>
      <p className="truncate text-caption text-muted-foreground">{label}</p>
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
  const { data: profile } = useVillageProfile();
  const { data: eventsData } = useVillageEvents();
  const { data: unread = 0 } = useUnreadCount();

  const activeComplaints = (complaints?.data ?? []).filter((c) => c.status !== 'Resolved').length;
  const pendingCerts = (applications?.data ?? []).filter(
    (a) => a.status === 'Submitted' || a.status === 'UnderReview',
  ).length;
  const outstanding = tax?.totalDues ?? 0;
  const latestNotices = (notices?.data ?? []).slice(0, 4);
  const latestSchemes = (schemes?.data ?? []).slice(0, 4);
  const nextEvent = (eventsData?.data ?? [])[0];
  const contacts = (profile?.emergencyContacts ?? []).slice(0, 6);
  const officials = sortMembers(profile?.members ?? []).slice(0, 6);

  const firstName = user?.fullName?.split(' ')[0];
  const villageName = profile?.general?.villageName;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 lg:px-6">
      {/* Greeting + date */}
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-title text-foreground">
            {t('home.welcome')}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-0.5 truncate text-body text-muted-foreground">
            {villageName ? `${villageName} · ` : ''}
            {formatDate(new Date(), locale)}
          </p>
        </div>
      </header>

      {/* Hero event — always above the fold. */}
      <EventHero event={nextEvent} locale={locale} t={t} />

      {/* Gram Panchayat officials — between events and quick services. */}
      <section aria-labelledby="officials-h">
        <SectionHeader
          id="officials-h"
          title={t('directory.officials')}
          action={
            <Link
              to="/directory"
              className="rounded-md px-1 py-0.5 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
            >
              {t('directory.viewAll')}
            </Link>
          }
        />
        {officials.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {officials.map((m) => (
              <OfficialCard key={m.id} member={m} variant="compact" />
            ))}
          </div>
        ) : (
          <Card>
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="text-body text-muted-foreground">{t('directory.willUpdate')}</p>
              <Link
                to="/directory"
                className="text-caption font-medium text-primary hover:text-primary-hover"
              >
                {t('directory.viewAll')}
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* Quick services */}
      <section aria-labelledby="qs-h">
        <SectionHeader id="qs-h" title={t('home.services')} />
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {SERVICES.map(({ to, label, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-2 text-center shadow-xs transition-[box-shadow,transform] duration-150 hover:border-primary/40 hover:shadow-sm active:translate-y-px"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <span className="text-caption font-medium leading-tight text-foreground">
                {t(label)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Status cards */}
      <section aria-labelledby="status-h">
        <SectionHeader id="status-h" title={t('home.statusTitle')} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <StatCard
            icon={Bell}
            value={unread}
            label={t('home.unread')}
            to="/notifications"
            tone="info"
          />
        </div>
      </section>

      {/* Notices + schemes side by side on desktop. */}
      <div className="grid gap-6 lg:grid-cols-2">
        {latestNotices.length ? (
          <section aria-labelledby="notices-h">
            <SectionHeader
              id="notices-h"
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
          <section aria-labelledby="schemes-h">
            <SectionHeader
              id="schemes-h"
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {latestSchemes.map((s) => (
                <Link
                  key={s.id}
                  to={`/schemes/${s.id}`}
                  className="flex min-h-16 items-start rounded-xl border border-border bg-card p-3 shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
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

      {/* Emergency contacts — target of the Emergency quick service. */}
      {contacts.length ? (
        <section id="emergency" aria-labelledby="emergency-h" className="scroll-mt-20">
          <SectionHeader id="emergency-h" title={t('public.emergency')} />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c, i) => (
              <a
                key={`${c.label}-${i}`}
                href={`tel:${c.phone}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-colors duration-150 hover:bg-accent"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive-subtle text-destructive-strong">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-foreground">
                    {c.label}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {c.phone}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
