import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';

export function SchemeCard({ scheme }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/schemes/${scheme.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      {scheme.imageUrl ? (
        <img src={scheme.imageUrl} alt="" className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 w-full items-center justify-center bg-muted">
          <Landmark className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
      <div className="flex-1 p-3">
        <p className="text-sm font-medium text-foreground">{scheme.title}</p>
        {scheme.summary ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{scheme.summary}</p>
        ) : null}
        <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
          {t(`scheme.category.${scheme.category}`, scheme.category)}
        </span>
      </div>
    </Link>
  );
}
