import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Paperclip } from 'lucide-react';
import { formatDate, pickLocale } from '@dgp/shared';

export function NoticeCard({ notice }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const title = pickLocale(notice.i18n, 'title', locale, notice.title);
  const summary = pickLocale(notice.i18n, 'summary', locale, notice.summary);

  return (
    <Link
      to={`/notices/${notice.id}`}
      className="block rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</p>
        {notice.attachmentUrl ? (
          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : null}
      </div>
      {summary ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{summary}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {t(`notice.category.${notice.category}`, notice.category)} ·{' '}
        {formatDate(notice.publishDate || notice.createdAt, locale)}
      </p>
    </Link>
  );
}
