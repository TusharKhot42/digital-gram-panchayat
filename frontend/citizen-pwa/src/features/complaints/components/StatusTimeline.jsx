import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@dgp/shared';

export function StatusTimeline({ history = [] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';

  if (history.length === 0) return null;

  return (
    <ol className="space-y-4">
      {history.map((entry, idx) => (
        <li key={`${entry.status}-${entry.at}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${idx === history.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`}
            />
            {idx < history.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">
              {t(`complaint.status.${entry.status}`, entry.status)}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(entry.at, locale)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
