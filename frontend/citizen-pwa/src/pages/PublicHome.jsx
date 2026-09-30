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
  Building2,
  Award,
  Clock,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@dgp/shared';
import logo from '@dgp/shared/assets/logo.svg';
import { HERO, eventArtFor } from '@/components/Artwork';
import { SafeImage } from '@/components/SafeImage';
import { MapView } from '@/components/MapView';
import { LanguageGate } from '@/components/LanguageGate';
import { useLanguage } from '@/store';
import { useVillageProfile, useVillageEvents } from '@/features/village/hooks';
import { useNotices } from '@/features/notices/hooks';
import { useSchemes } from '@/features/schemes/hooks';
import { PublicImportantContacts } from '@/components/PublicImportantContacts';

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

// In-page anchor links for the footer.
const QUICK_LINKS = [
  { href: '#services', key: 'public.services' },
  { href: '#notices', key: 'public.latestNotices' },
  { href: '#schemes', key: 'public.latestSchemes' },
  { href: '#emergency', key: 'public.emergency' },
];

// Official Government of India / Maharashtra portals (public, static — not sourced data).
const GOV_LINKS = [
  { href: 'https://www.india.gov.in', label: 'India.gov.in' },
  { href: 'https://www.maharashtra.gov.in', label: 'Maharashtra Govt.' },
  { href: 'https://www.digitalindia.gov.in', label: 'Digital India' },
];

// Location facts shown in the About sidebar (keys map to i18n labels).
const ABOUT_FACTS = ['taluka', 'district', 'state', 'pinCode'];

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
  const { language, toggleLanguage } = useLanguage();
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
  const awards = profile?.awards ?? [];
  const hasMap = typeof g.latitude === 'number' && typeof g.longitude === 'number';

  const lead = profile?.leadership ?? {};
  const officeAddress = [
    g.panchayatName || villageName,
    g.taluka ? `Tal. ${g.taluka}` : '',
    g.district ? `Dist. ${g.district}` : '',
    g.state,
    g.pinCode ? `PIN ${g.pinCode}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  const aboutFacts = ABOUT_FACTS.map((k) => [k, g[k]]).filter(([, v]) => v);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-dvh bg-background">
      <LanguageGate />
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#6495ED]/40 bg-[#1E3A8A] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <SafeImage
              src={g.logo || logo}
              alt=""
              className="h-9 w-9 rounded-lg bg-white/10 p-0.5"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white tracking-tight">
                {villageName}
              </p>
              {g.panchayatName ? (
                <p className="truncate text-xs font-medium text-[#93C5FD]">{g.panchayatName}</p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex min-h-10 items-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6495ED]"
              aria-label={language === 'mr' ? 'Switch to English' : 'मराठीत बदला'}
            >
              {language === 'mr' ? 'English' : 'मराठी'}
            </button>
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-150 active:scale-95 border border-amber-300/60"
            >
              <LogIn className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              {t('public.enter')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative isolate overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <SafeImage
          src={g.banner || HERO.gramPanchayatBanner || HERO.villageWelcome}
          alt=""
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-85 transition-opacity duration-300"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/35" />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-display font-extrabold text-white drop-shadow-md">{villageName}</h1>
          {g.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-body leading-relaxed text-white/95 drop-shadow-xs">
              {g.description}
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-2xl text-body text-white/95 drop-shadow-xs">
              {t('public.tagline')}
            </p>
          )}
          {(g.taluka || g.district) && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-caption font-semibold text-white/90">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {[g.taluka, g.district, g.state].filter(Boolean).join(', ')}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 text-sm font-extrabold shadow-lg transition-all duration-150 hover:scale-105 active:scale-95 border border-amber-300/60"
            >
              <LogIn className="h-4.5 w-4.5 stroke-[2.5]" aria-hidden="true" />
              {t('public.enter')}
            </Link>
          </div>
        </div>
      </div>

      {/* About the village */}
      {g.description || g.history || aboutFacts.length ? (
        <Section id="about" title={t('public.about')}>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3 md:col-span-2">
              {g.description ? (
                <p className="text-body leading-relaxed text-foreground">{g.description}</p>
              ) : null}
              {g.history ? (
                <p className="text-body leading-relaxed text-muted-foreground">{g.history}</p>
              ) : null}
            </div>
            {aboutFacts.length ? (
              <dl className="h-fit space-y-2 rounded-lg border border-border bg-card p-4 shadow-xs">
                {aboutFacts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-caption text-muted-foreground">{t(`public.field.${k}`)}</dt>
                    <dd className="text-caption font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </Section>
      ) : null}

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
                className="group flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#6495ED]/70 hover:shadow-md active:translate-y-0"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#1E3A8A] transition-colors duration-200 group-hover:bg-[#1E3A8A] group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-body font-bold text-foreground transition-colors group-hover:text-[#1E3A8A]">
                  {title}
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Latest notices + schemes. One page-level container (identical width to every other
          section) holding a two-column inner grid — previously each list was its own centred
          max-w-5xl Section nested inside the grid, so it centred within its column instead of
          the page and rendered narrow and off-axis whenever only one list had content. */}
      {notices.length || schemes.length ? (
        <section
          aria-labelledby={notices.length ? 'notices-h' : 'schemes-h'}
          className="mx-auto w-full max-w-5xl px-4 py-8"
        >
          {/* min-w-0 on each column: a grid item's default `min-width: auto` sized the column
              to its longest notice title (367px inside a 288px grid at 320px), so `truncate`
              below never engaged and the page scrolled sideways. */}
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            {notices.length ? (
              <div className="min-w-0">
                <h2 id="notices-h" className="mb-5 text-title text-foreground">
                  {t('public.latestNotices')}
                </h2>
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
              </div>
            ) : null}
            {schemes.length ? (
              <div className="min-w-0">
                <h2 id="schemes-h" className="mb-5 text-title text-foreground">
                  {t('public.latestSchemes')}
                </h2>
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
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Upcoming events */}
      {events.length ? (
        <Section id="events" title={t('public.events')}>
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((e) => (
              <article
                key={e.id}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-xs"
              >
                {/* Every card gets a picture; without one the grid was a wall of grey blocks. */}
                <SafeImage
                  src={e.banner || eventArtFor(e.title)}
                  alt=""
                  className="h-36 w-full object-cover"
                />
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

      {/* Achievements */}
      {awards.length ? (
        <Section id="achievements" title={t('public.achievements')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((a) => (
              <article key={a.id} className="rounded-lg border border-border bg-card p-4 shadow-xs">
                {a.image ? (
                  <SafeImage
                    src={a.image}
                    alt=""
                    loading="lazy"
                    className="mb-3 h-32 w-full rounded object-cover"
                  />
                ) : (
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary">
                    <Award className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
                <h3 className="text-section text-foreground">
                  {a.name}
                  {a.year ? (
                    <span className="text-caption font-normal text-muted-foreground">
                      {' '}
                      · {a.year}
                    </span>
                  ) : null}
                </h3>
                {a.description ? (
                  <p className="mt-1 text-caption text-muted-foreground">{a.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Gram Panchayat Important Contacts Cards */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <PublicImportantContacts />
      </div>

      {/* Location */}
      {hasMap ? (
        <Section id="location" title={t('public.location')}>
          <MapView latitude={g.latitude} longitude={g.longitude} height={280} interactive />
        </Section>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-[#6495ED]/40 bg-[#1E3A8A] text-white shadow-md">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <SafeImage
                src={g.logo || logo}
                alt=""
                className="h-8.5 w-8.5 rounded-lg bg-white/10 p-0.5"
              />
              <p className="text-body font-bold text-white">{g.panchayatName || villageName}</p>
            </div>
            <p className="text-caption leading-relaxed text-[#93C5FD]">{t('public.tagline')}</p>
          </div>

          {/* Quick links */}
          <nav aria-label={t('public.quickLinks')} className="space-y-2.5">
            <p className="text-label font-bold text-white uppercase tracking-wider text-xs">
              {t('public.quickLinks')}
            </p>
            <ul className="space-y-1.5 text-caption">
              {QUICK_LINKS.map((q) => (
                <li key={q.href}>
                  <a
                    href={q.href}
                    className="text-slate-200 transition-colors duration-150 hover:text-white hover:underline"
                  >
                    {t(q.key)}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/help"
                  className="text-slate-200 transition-colors duration-150 hover:text-white hover:underline"
                >
                  {t('help.title')}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-slate-200 transition-colors duration-150 hover:text-white hover:underline font-semibold"
                >
                  {t('public.enter')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Government links */}
          <nav aria-label={t('public.govLinks')} className="space-y-2.5">
            <p className="text-label font-bold text-white uppercase tracking-wider text-xs">
              {t('public.govLinks')}
            </p>
            <ul className="space-y-1.5 text-caption">
              {GOV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-slate-200 transition-colors duration-150 hover:text-white hover:underline"
                  >
                    {l.label}
                    <ExternalLink className="h-3 w-3 text-[#93C5FD]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Office */}
          <div className="space-y-2.5">
            <p className="text-label font-bold text-white uppercase tracking-wider text-xs">
              {t('public.office')}
            </p>
            <address className="space-y-1.5 not-italic text-caption text-slate-200">
              {officeAddress ? (
                <p className="flex items-start gap-1.5">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#93C5FD]"
                    aria-hidden="true"
                  />
                  <span>{officeAddress}</span>
                </p>
              ) : null}
              {lead.officeTimings ? (
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden="true" />
                  {lead.officeTimings}
                </p>
              ) : null}
              {lead.contactNumbers ? (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden="true" />
                  <a
                    href={`tel:${lead.contactNumbers}`}
                    className="hover:text-white hover:underline"
                  >
                    {lead.contactNumbers}
                  </a>
                </p>
              ) : null}
              {lead.officeEmail ? (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden="true" />
                  <a
                    href={`mailto:${lead.officeEmail}`}
                    className="hover:text-white hover:underline"
                  >
                    {lead.officeEmail}
                  </a>
                </p>
              ) : null}
            </address>
          </div>
        </div>

        <div className="border-t border-[#6495ED]/30 bg-black/10">
          <p className="mx-auto max-w-5xl px-4 py-4 text-center text-caption text-slate-300">
            © {year} {g.panchayatName || villageName}. {t('public.rights')} · {t('appName')}
          </p>
        </div>
      </footer>
    </div>
  );
}
