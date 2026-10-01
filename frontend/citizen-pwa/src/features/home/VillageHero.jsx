import { useTranslation } from 'react-i18next';
import { CalendarDays, CloudSun, Languages, MapPin, Moon, Sun } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import { SafeImage } from '@/components/SafeImage';
import { HERO } from '@/components/Artwork';
import { useTheme, useLanguage } from '@/store';

/** Morning / afternoon / evening, from the device clock. */
function greetingKey(hour) {
  if (hour < 12) return 'home.goodMorning';
  if (hour < 17) return 'home.goodAfternoon';
  return 'home.goodEvening';
}

/**
 * The masthead of the citizen portal: the village itself, not the app.
 *
 * A villager opening this should see where they are (village, taluka, district), when they
 * are (date), and who they are (greeting) before anything else. The banner is the village
 * photo an officer uploads in the Village Profile; with none, the same government-blue scrim
 * used elsewhere stands in.
 */
export function VillageHero({ profile, firstName, ward }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const g = profile?.general ?? {};
  const now = new Date();
  // Taluka / district, skipping whichever the profile has not filled in.
  const place = [g.taluka, g.district].filter(Boolean).join(', ');

  const chip =
    'inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-caption font-medium backdrop-blur';

  return (
    <section
      aria-label={t('home.villageHeader')}
      className="relative isolate overflow-hidden rounded-2xl border border-border shadow-sm"
    >
      {/*
       * The officer's village photograph when there is one, the drawn village scene when there
       * is not. Either way the masthead shows the village rather than a rectangle of blue.
       */}
      <SafeImage
        src={g.banner || HERO.gramPanchayatBanner || HERO.villageWelcome}
        alt=""
        loading="eager"
        fetchpriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

      <div className="flex flex-col gap-4 p-5 text-white sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-display font-semibold leading-tight text-white drop-shadow-xs break-words">
              {g.villageName || t('appName')}
            </h1>
            {place ? (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-caption sm:text-body text-white/90">
                <MapPin className="h-4 w-4 shrink-0 text-white/90" aria-hidden="true" />
                <span className="break-words">{place}</span>
              </p>
            ) : null}
          </div>

          {/* Language and theme within thumb reach of the first screen — the two settings a
              first-time visitor is most likely to want. */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t('nav.toggleLanguage')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors duration-150 hover:bg-white/25"
            >
              <Languages className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{language === 'mr' ? 'EN' : 'मर'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t(theme === 'dark' ? 'nav.themeLight' : 'nav.themeDark')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors duration-150 hover:bg-white/25"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <p className="text-section font-medium">
          {t(greetingKey(now.getHours()))}
          {firstName ? `, ${firstName}` : ''}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {ward && (
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-amber-400/25 border border-amber-300/40 px-3 text-caption font-semibold backdrop-blur text-amber-100 shadow-xs">
              <MapPin className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>{ward}</span>
            </span>
          )}
          <span className={chip}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDate(now, locale)}
          </span>
          {/*
           * Weather slot. Deliberately shows no temperature: nothing in this system supplies
           * weather, and inventing one on a village portal would be worse than an honest gap.
           * Wire a provider to `profile.weather` and this chip fills itself in.
           */}
          <span className={chip} title={t('home.weatherUnavailable')}>
            <CloudSun className="h-4 w-4" aria-hidden="true" />
            {t('home.weatherUnavailable')}
          </span>
        </div>
      </div>
    </section>
  );
}
