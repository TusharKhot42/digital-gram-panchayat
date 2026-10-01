import { Link } from 'react-router-dom';
import { SafeImage } from '@/components/SafeImage';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';
import { pickLocale } from '@dgp/shared';

export function SchemeCard({ scheme }) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language || '').toLowerCase().startsWith('mr') ? 'mr' : 'en';
  const title = pickLocale(scheme.i18n, 'title', locale, scheme.title);
  const summary = pickLocale(scheme.i18n, 'summary', locale, scheme.summary);

  return (
    <Link
      to={`/schemes/${scheme.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:translate-y-px"
    >
      {scheme.imageUrl ? (
        <SafeImage src={scheme.imageUrl} loading="lazy" className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 w-full items-center justify-center bg-primary-subtle">
          <Landmark className="h-8 w-8 text-primary/40" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <p className="text-body font-medium text-foreground">{title}</p>
        {summary ? (
          <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">{summary}</p>
        ) : null}
        <span className="mt-2.5 inline-block w-fit rounded-full bg-secondary px-2.5 py-0.5 text-caption font-medium text-secondary-foreground ring-1 ring-inset ring-border">
          {t(`scheme.category.${scheme.category}`, scheme.category)}
        </span>
      </div>
    </Link>
  );
}
