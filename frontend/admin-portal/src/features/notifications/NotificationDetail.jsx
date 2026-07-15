import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { useBroadcastRecipients } from './hooks';

const STATUS_CLASS = {
  queued: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

/** Recipient-level breakdown for one broadcast (drill-in from the rollup dashboard). */
export function NotificationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading, isError } = useBroadcastRecipients(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !data) return <p className="text-sm text-destructive">{t('ntf.notFound')}</p>;

  const { broadcast: b, recipients, total } = data;

  return (
    <div className="max-w-2xl">
      <Link
        to="/notifications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('ntf.back')}
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold text-foreground">{b.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{b.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {(b.channels || []).join(', ')} · {formatDateTime(b.createdAt, locale)} ·{' '}
          {t('ntf.recipientsCount', { count: total })}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('ntf.detail.recipient')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.mobile')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.status')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.read')}</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2 text-foreground">{r.name || '—'}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.mobile || '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[r.status]}`}
                  >
                    {t(`ntf.status.${r.status}`, r.status)}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {r.read ? t('ntf.readYes') : t('ntf.readNo')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
