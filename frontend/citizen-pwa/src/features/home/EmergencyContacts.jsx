import { useTranslation } from 'react-i18next';
import { Phone, ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

/**
 * One-tap calling. These are the numbers someone reaches for in the worst minute of their
 * day, so the whole card is the call target, the number is large, and nothing else competes
 * for the tap. Only contacts the Gram Panchayat has actually published are shown.
 */
export function EmergencyContacts({ contacts }) {
  const { t } = useTranslation();

  return (
    <section id="emergency" aria-labelledby="emergency-h" className="scroll-mt-20">
      <h2 id="emergency-h" className="mb-2 text-section text-foreground">
        {t('public.emergency')}
      </h2>

      {contacts.length ? (
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c, i) => (
            <li key={`${c.label}-${i}`}>
              <a
                href={`tel:${c.phone}`}
                className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-[background-color,box-shadow,transform] duration-150 hover:bg-accent hover:shadow-sm active:translate-y-px"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-subtle text-destructive-strong">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-foreground">
                    {c.label}
                  </span>
                  <span className="block truncate text-title tabular-nums text-foreground">
                    {c.phone}
                  </span>
                </span>
                <span className="sr-only">{t('directory.call')}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={ShieldAlert} title={t('home.noEmergency')} />
      )}
    </section>
  );
}
