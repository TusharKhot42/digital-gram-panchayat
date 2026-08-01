import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import {
  Banknote,
  BookOpen,
  Building2,
  Home,
  Landmark,
  Mail,
  Map,
  Route,
  Stethoscope,
  Users,
} from 'lucide-react';

/**
 * The statistics an officer maintains, in the order a villager reads them. Anything the
 * profile does not carry is skipped — the list is never padded with placeholders.
 */
const FIELDS = [
  ['population', Users],
  ['families', Home],
  ['literacyRate', BookOpen],
  ['area', Map],
  ['schools', Building2],
  ['hospitals', Stethoscope],
  ['banks', Banknote],
  ['postOffice', Mail],
  ['roadConnectivity', Route],
  ['sexRatio', Landmark],
];

/**
 * Splits "9,144" or "72.13%" into a number and whatever sits around it, so the number can
 * count up while the unit stays put. Returns null for values like "Not Available", which are
 * shown as-is rather than animated into nonsense.
 */
function parseStat(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const match = text.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { numeric: null, text };
  const numeric = Number(match[2].replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return { numeric: null, text };
  return {
    prefix: match[1],
    numeric,
    suffix: match[3],
    decimals: (match[2].split('.')[1] || '').length,
  };
}

/** Counts from 0 to `value` once, when scrolled into view. Static if the user prefers that. */
function useCountUp(value, enabled) {
  const [shown, setShown] = useState(enabled ? 0 : value);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;

    /*
     * The animation is an enhancement; the number is the point. Every path that cannot animate
     * must still end on the real figure, because a stalled counter does not look stalled — it
     * looks like the village has a population of 0.
     *
     * Neither requestAnimationFrame nor IntersectionObserver runs while the document is
     * hidden, which is the normal state of a backgrounded PWA, so that case is settled up
     * front rather than left to a callback that will never arrive.
     */
    const settle = () => setShown(value);

    if (
      !enabled ||
      !node ||
      typeof IntersectionObserver === 'undefined' ||
      document.visibilityState !== 'visible'
    ) {
      settle();
      return undefined;
    }

    let frame;
    let backstop;
    const DURATION = 900;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / DURATION);
          // easeOutCubic — quick to read, settles rather than stops dead.
          setShown(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        // Timers keep running when frames do not: whatever happens, land on the real figure.
        backstop = setTimeout(settle, DURATION + 250);
      },
      { threshold: 0.25 },
    );
    observer.observe(node);

    // If the citizen leaves the tab mid-scroll, stop animating and show the figure.
    document.addEventListener('visibilitychange', settle);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', settle);
      if (frame) cancelAnimationFrame(frame);
      if (backstop) clearTimeout(backstop);
    };
  }, [value, enabled]);

  return [ref, shown];
}

function StatCard({ icon: Icon, label, raw, animate }) {
  const parsed = parseStat(raw);
  const canCount = animate && parsed?.numeric != null;
  const [ref, shown] = useCountUp(parsed?.numeric ?? 0, canCount);

  const display =
    parsed?.numeric == null
      ? parsed?.text
      : `${parsed.prefix ?? ''}${(canCount ? shown : parsed.numeric).toLocaleString(undefined, {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals,
        })}${parsed.suffix ?? ''}`;

  return (
    <div
      ref={ref}
      className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-xs"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <p className="truncate text-title tabular-nums text-foreground">{display}</p>
      <p className="truncate text-caption text-muted-foreground">{label}</p>
    </div>
  );
}

export function VillageStats({ statistics }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  const rows = FIELDS.filter(([key]) => {
    const v = statistics?.[key];
    return v != null && String(v).trim() !== '';
  });
  if (!rows.length) return null;

  return (
    <section aria-labelledby="stats-h">
      <h2 id="stats-h" className="mb-2 text-section text-foreground">
        {t('home.statsTitle')}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map(([key, Icon]) => (
          <StatCard
            key={key}
            icon={Icon}
            label={t(`village.stat.${key}`, key)}
            raw={statistics[key]}
            animate={!reduced}
          />
        ))}
      </div>
    </section>
  );
}
