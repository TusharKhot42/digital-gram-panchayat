import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useNotification, useNotificationMutations } from './hooks';

export function NotificationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: n, isLoading, isError } = useNotification(id);
  const m = useNotificationMutations();

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !n) return <p className="text-sm text-destructive">{t('ntf.notFound')}</p>;

  const retry = async () => {
    try {
      await m.retry.mutateAsync(n.id);
      toast.success(t('ntf.retried'));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('ntf.actionFailed'));
    }
  };

  const rows = [
    [t('ntf.col.status'), t(`ntf.status.${n.status}`, n.status)],
    [t('ntf.col.module'), n.module],
    [t('ntf.col.channel'), (n.channels || []).join(', ')],
    [t('ntf.detail.recipient'), n.to || n.recipientId],
    [t('ntf.detail.retries'), n.retryCount],
    [t('ntf.detail.provider'), n.providerMessageId || '—'],
    [t('ntf.detail.delivered'), n.deliveredAt ? formatDateTime(n.deliveredAt, locale) : '—'],
    [t('ntf.detail.read'), n.readAt ? formatDateTime(n.readAt, locale) : '—'],
    [t('ntf.detail.created'), formatDateTime(n.createdAt, locale)],
  ];

  return (
    <div className="max-w-xl">
      <Link
        to="/notifications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('ntf.back')}
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold text-foreground">{n.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{n.notificationId}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{n.message}</p>

        {n.error ? (
          <div className="mt-3 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {n.error}
          </div>
        ) : null}

        <dl className="mt-4 space-y-2 border-t border-border pt-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-foreground">{String(value)}</dd>
            </div>
          ))}
        </dl>

        {n.status === 'failed' ? (
          <Button className="mt-5" size="sm" onClick={retry} disabled={m.retry.isPending}>
            <RotateCw className="h-4 w-4" />
            {t('ntf.retry')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
