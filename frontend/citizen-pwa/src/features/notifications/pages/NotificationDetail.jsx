import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { useNotification, useMarkRead } from '../hooks';

export function NotificationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: n, isLoading, isError } = useNotification(id);
  const markRead = useMarkRead();

  // Mark read on open (once, when it loads unread).
  useEffect(() => {
    if (n && !n.readAt) markRead.mutate(n.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n?.id]);

  if (isLoading)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !n)
    return <p className="px-4 py-6 text-sm text-destructive">{t('notif.notFound')}</p>;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/notifications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('notif.back')}
      </Link>
      <h1 className="text-lg font-semibold text-foreground">
        {pickLocale(n.i18n, 'title', locale, n.title)}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt, locale)}</p>
      <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">
        {pickLocale(n.i18n, 'message', locale, n.message)}
      </p>

      {n.entityId && n.module === 'complaint' ? (
        <Link to={`/complaints/${n.entityId}`} className="mt-6 inline-block text-sm text-primary">
          {t('notif.viewComplaint')}
        </Link>
      ) : null}
      {n.entityId && n.module === 'certificate' ? (
        <Link to={`/dakhala/${n.entityId}`} className="mt-6 inline-block text-sm text-primary">
          {t('notif.viewCertificate')}
        </Link>
      ) : null}
    </div>
  );
}
