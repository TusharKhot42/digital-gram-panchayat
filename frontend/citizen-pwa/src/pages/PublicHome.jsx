import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LogIn,
  MapPin,
  Phone,
  ClipboardList,
  FileText,
  Landmark,
  Receipt,
  Megaphone,
  ShieldAlert,
  CalendarDays,
  Users,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '@dgp/shared';
import logo from '@/assets/logo.svg';
import { SafeImage } from '@/components/SafeImage';
import { MapView } from '@/components/MapView';
import { useVillageProfile, useVillageEvents } from '@/features/village/hooks';
import { useNotices } from '@/features/notices/hooks';
import { useSchemes } from '@/features/schemes/hooks';

// The portal's built-in services — shown when an officer hasn't configured custom cards.
// Guests are pointed at login (the actions themselves need a session).
const DEFAULT_SERVICES = [
  { key: 'complaints', icon: ClipboardList },
  { key: 'dakhala', icon: FileText },
  { key: 'schemes', icon: Landmark },
  { key: 'tax', icon: Receipt },
  { key: 'notices', icon: Megaphone },
  { key: 'emergency', icon: ShieldAlert },
];

function Section({ id, title, children, className = '' }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`mx-auto w-full max-w-5xl px-4 py-10 ${className}`}
    >
      {title ? (
        <h2 id={`${id}-h`} className="mb-5 text-title text-foreground">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

/** Humanize a statistics key ("literacyRate" → "Literacy rate"). */
function humanize(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function PublicHome() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: profile } = useVillageProfile();
  const { data: eventsData } = useVillageEvents();
  const { data: noticesData } = useNotices();
  const { data: schemesData } = useSchemes();

  const g = profile?.general ?? {};
  const villageName = g.villageName || t('appName');
  const stats = Object.entries(profile?.statistics ?? {}).filter(([, v]) => v !== '' && v != null);
  const services = profile?.services?.length ? profile.services : DEFAULT_SERVICES;
  const notices = (noticesData?.data ?? []).slice(0, 5);
  const schemes = (schemesData?.data ?? []).slice(0, 5);
  const events = (eventsData?.data ?? []).slice(0, 4);
  const gallery = (profile?.gallery ?? []).slice(0, 6);
  const contacts = profile?.emergencyContacts ?? [];
  const hasMap = typeof g.latitude === 'number' && typeof g.longitude === 'number';

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <SafeImage src={g.logo || logo} alt="" className="h-9 w-9 rounded" />
            <div className="min-w-0">
              <p className="truncate text-section text-foreground">{villageName}</p>
              {g.panchayatName ? (
                <p className="truncate text-caption text-muted-foreground">{g.panchayatName}</p>
              ) : null}
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-body font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {t('public.enter')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative isolate overflow-hidden border-b border-border bg-primary text-primary-foreground">
        {g.banner ? (
          <SafeImage
            src={g.banner}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        ) : null}
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <h1 className="text-display">{villageName}</h1>
          {g.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-body leading-relaxed opacity-90">
              {g.description}
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-2xl text-body opacity-90">{t('public.tagline')}</p>
          )}
          {(g.taluka || g.district) && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-caption opacity-90">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {[g.taluka, g.district, g.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats.length ? (
        <Section id="stats" title={t('public.stats')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats.map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-border bg-card p-4 text-center shadow-xs"
              >
                <p className="text-title tabular-nums text-foreground">{String(value)}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">{humanize(key)}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Public services */}
      <Section id="services" title={t('public.services')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon || Building2;
            const title = s.title || t(`nav.${s.key}`, s.key);
            return (
              <Link
                key={s.key || s.title}
                to="/login"
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 text-center shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-body font-medium text-foreground">{title}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Latest notices + schemes */}
      <div className="grid gap-0 md:grid-cols-2">
        {notices.length ? (
          <Section id="notices" title={t('public.latestNotices')} className="py-8">
            <ul className="space-y-2">
              {notices.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-border bg-card px-4 py-3 shadow-xs"
                >
                  <p className="truncate text-body font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {formatDate(n.publishDate || n.createdAt, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        {schemes.length ? (
          <Section id="schemes" title={t('public.latestSchemes')} className="py-8">
            <ul className="space-y-2">
              {schemes.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-border bg-card px-4 py-3 shadow-xs"
                >
                  <p className="truncate text-body font-medium text-foreground">{s.title}</p>
                  {s.summary ? (
                    <p className="mt-0.5 line-clamp-1 text-caption text-muted-foreground">
                      {s.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      {/* Upcoming events */}
      {events.length ? (
        <Section id="events" title={t('public.events')}>
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((e) => (
              <article
                key={e.id}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-xs"
              >
                {e.banner ? (
                  <SafeImage src={e.banner} alt="" className="h-36 w-full object-cover" />
                ) : null}
                <div className="p-4">
                  <p className="inline-flex items-center gap-1.5 text-caption text-primary">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDate(e.startDate, locale)}
                  </p>
                  <h3 className="mt-1 text-section text-foreground">{e.title}</h3>
                  {e.location ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-caption text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {e.location}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Gallery */}
      {gallery.length ? (
        <Section id="gallery" title={t('public.gallery')}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {gallery.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-lg border border-border">
                <SafeImage
                  src={item.image}
                  alt={item.title || ''}
                  loading="lazy"
                  className="h-32 w-full object-cover sm:h-40"
                />
                {item.title ? (
                  <figcaption className="truncate bg-card px-2 py-1 text-caption text-muted-foreground">
                    {item.title}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Emergency contacts */}
      {contacts.length ? (
        <Section id="emergency" title={t('public.emergency')}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c, i) => (
              <a
                key={`${c.label}-${i}`}
                href={`tel:${c.phone}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors duration-150 hover:bg-accent"
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
        </Section>
      ) : null}

      {/* Location */}
      {hasMap ? (
        <Section id="location" title={t('public.location')}>
          <MapView latitude={g.latitude} longitude={g.longitude} height={280} interactive />
        </Section>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-body font-medium text-foreground">
              {g.panchayatName || villageName}
            </p>
          </div>
          {profile?.leadership?.officeEmail ? (
            <p className="text-caption text-muted-foreground">{profile.leadership.officeEmail}</p>
          ) : null}
          <Link
            to="/login"
            className="mt-2 inline-flex items-center gap-1 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
          >
            {t('public.enter')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-caption text-muted-foreground">{t('appName')}</p>
        </div>
      </footer>
    </div>
  );
}
