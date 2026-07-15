import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
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
    return <p className="dgp-page text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !n)
    return <p className="dgp-page text-body text-destructive-strong">{t('notif.notFound')}</p>;

  const link =
    n.entityId && n.module === 'complaint'
      ? { to: `/complaints/${n.entityId}`, label: t('notif.viewComplaint') }
      : n.entityId && n.module === 'certificate'
        ? { to: `/dakhala/${n.entityId}`, label: t('notif.viewCertificate') }
        : null;

  return (
    <div className="dgp-page">
      <PageHeader
        backTo="/notifications"
        backLabel={t('notif.back')}
        title={pickLocale(n.i18n, 'title', locale, n.title)}
        subtitle={formatDateTime(n.createdAt, locale)}
      />

      <Card>
        <CardContent>
          <p className="whitespace-pre-wrap text-body leading-relaxed text-body-foreground">
            {pickLocale(n.i18n, 'message', locale, n.message)}
          </p>
        </CardContent>
      </Card>

      {link ? (
        <Button asChild className="mt-5 w-full">
          <Link to={link.to}>
            {link.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
