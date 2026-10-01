import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Megaphone,
  Landmark,
  FileText,
  Receipt,
  Gavel,
  HardHat,
  Vote,
  Download,
  CalendarClock,
} from 'lucide-react';
import { SectionHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { NoEventsArt, NoNoticesArt, NoSchemesArt } from '@/components/Illustration';
import { useAuth } from '@/hooks/useAuth';
import { useMyComplaints } from '@/features/complaints/hooks';
import { useMyApplications } from '@/features/dakhala/hooks';
import { useMyTax } from '@/features/tax/hooks';
import { useNotices } from '@/features/notices/hooks';
import { useSchemes } from '@/features/schemes/hooks';
import { useVillageProfile, useVillageEvents } from '@/features/village/hooks';
import { NoticeCard } from '@/features/notices/components/NoticeCard';
import { SchemeCard } from '@/features/schemes/components/SchemeCard';
import { VillageHero } from '@/features/home/VillageHero';
import { GlobalSearch } from '@/features/home/GlobalSearch';
import { PriorityBoard } from '@/features/home/PriorityBoard';
import { EmergencyContacts } from '@/features/home/EmergencyContacts';
import { EventCard, daysUntil } from '@/features/home/EventCard';
import { useMeetings, useProjects, useDownloads } from '@/features/governance/hooks';

// Quick services — every entry point a citizen has.
const SERVICES = [
  {
    to: '/complaints/new',
    label: 'nav.complaints',
    icon: ClipboardList,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  },
  {
    to: '/dakhala',
    label: 'nav.dakhala',
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    to: '/tax',
    label: 'nav.tax',
    icon: Receipt,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
  },
  {
    to: '/schemes',
    label: 'nav.schemes',
    icon: Landmark,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
  },
  {
    to: '/notices',
    label: 'nav.notices',
    icon: Megaphone,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  {
    to: '/meetings',
    label: 'nav.meetings',
    icon: Gavel,
    color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    to: '/projects',
    label: 'nav.projects',
    icon: HardHat,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400',
  },
  {
    to: '/polls',
    label: 'nav.polls',
    icon: Vote,
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400',
  },
  {
    to: '/downloads',
    label: 'nav.downloads',
    icon: Download,
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400',
  },
  {
    to: '/timetable',
    label: 'nav.timetable',
    icon: CalendarClock,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
];

export function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: complaints } = useMyComplaints();
  const { data: applications } = useMyApplications();
  const { data: tax } = useMyTax();
  const { data: notices } = useNotices();
  const { data: schemes } = useSchemes();
  const { data: profile } = useVillageProfile();
  const { data: eventsData } = useVillageEvents();
  // Fetched here purely so global search can reach them; each list caches for minutes.
  const { data: meetings } = useMeetings();
  const { data: projects } = useProjects();
  const { data: downloads } = useDownloads();

  const activeComplaints = (complaints?.data ?? []).filter((c) => c.status !== 'Resolved').length;
  const pendingCerts = (applications?.data ?? []).filter(
    (a) => a.status === 'Submitted' || a.status === 'UnderReview',
  ).length;
  const outstanding = tax?.totalDues ?? 0;
  const latestNotices = (notices?.data ?? []).slice(0, 4);
  const latestSchemes = (schemes?.data ?? []).slice(0, 4);

  const events = eventsData?.data ?? [];
  const [nextEvent, ...laterEvents] = events;
  // Anything happening today or tomorrow belongs in the "today" band, not further down.
  const imminentEvent = events.find((e) => daysUntil(e.startDate) <= 1);

  const contacts = profile?.emergencyContacts ?? [];
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-5 lg:px-6">
      {/* 1 — the village itself */}
      <VillageHero profile={profile} firstName={firstName} ward={user?.ward} />

      {/* One box across everything already loaded — no extra request, works offline. */}
      <GlobalSearch
        notices={notices?.data}
        schemes={schemes?.data}
        complaints={complaints?.data}
        applications={applications?.data}
        tax={tax?.data}
        profile={profile}
        events={events}
        meetings={meetings?.data}
        projects={projects?.data}
        downloads={downloads?.data}
      />

      {/* 2 — quick services, placed immediately below search bar */}
      <section aria-labelledby="qs-h">
        <SectionHeader id="qs-h" title={t('home.services')} />
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-10">
          {SERVICES.map(({ to, label, icon: Icon, color }) => (
            <Link
              key={label}
              to={to}
              className="group flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card p-2.5 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color} shadow-2xs transition-transform duration-150 group-hover:scale-110`}
              >
                <Icon className="h-5.5 w-5.5" aria-hidden="true" />
              </span>
              <span className="text-[0.8125rem] font-semibold leading-tight text-foreground tracking-tight">
                {t(label)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 — what this particular citizen has to deal with */}
      <PriorityBoard
        activeComplaints={activeComplaints}
        pendingCerts={pendingCerts}
        outstanding={outstanding}
        todayEvent={imminentEvent}
        latestNotice={latestNotices[0]}
        officeTimings={profile?.leadership?.officeTimings}
      />

      {/* 4 — upcoming events */}
      <section aria-labelledby="events-h">
        <SectionHeader
          id="events-h"
          title={t('home.upcomingEvents')}
          action={
            events.length > 1 ? (
              <Link
                to="/welcome#events"
                className="rounded-md px-1 py-0.5 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                {t('home.seeAll')}
              </Link>
            ) : null
          }
        />
        {nextEvent ? (
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EventCard event={nextEvent} featured />
            </div>
            {laterEvents.length ? (
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {laterEvents.slice(0, 2).map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            art={NoEventsArt}
            title={t('home.noEvents')}
            description={t('home.noEventsHint')}
          />
        )}
      </section>

      {/* 7 + 8 — notices and schemes, side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="notices-h" className="min-w-0">
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
          {latestNotices.length ? (
            <div className="grid gap-2.5">
              {latestNotices.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </div>
          ) : (
            <EmptyState art={NoNoticesArt} title={t('notice.list.empty')} />
          )}
        </section>

        <section aria-labelledby="schemes-h" className="min-w-0">
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
          {latestSchemes.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {latestSchemes.map((s) => (
                <SchemeCard key={s.id} scheme={s} />
              ))}
            </div>
          ) : (
            <EmptyState art={NoSchemesArt} title={t('scheme.list.empty')} />
          )}
        </section>
      </div>

      {/* 9 — emergency */}
      <EmergencyContacts contacts={contacts} />
    </div>
  );
}
