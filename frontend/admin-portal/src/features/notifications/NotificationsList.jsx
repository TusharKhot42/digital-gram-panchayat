import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { SkeletonRows } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { useBroadcasts, useNotificationStats } from './hooks';

const LIMIT = 20;

const STATUS_CLASS = {
  queued: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

/**
 * Broadcast dashboard: one row per broadcast (rolled up from per-recipient notifications),
 * with recipient/delivered/failed counts. Drill into a row for recipient detail. Individual
 * citizen notifications are intentionally not listed here — no redundancy.
 */
export function NotificationsList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useBroadcasts({ page, limit: LIMIT });
  const { data: stats } = useNotificationStats();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const statCards = [
    { label: t('ntf.stat.broadcasts'), value: total },
    { label: t('ntf.stat.total'), value: stats?.total ?? '—' },
    ...(stats?.byStatus ?? []).map((s) => ({
      label: t(`ntf.status.${s.label}`, s.label),
      value: s.value,
    })),
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('ntf.title')}</h1>
        <Button asChild size="sm">
          <Link to="/notifications/broadcast">
            <Send className="h-4 w-4" />
            {t('ntf.broadcast')}
          </Link>
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{t('ntf.broadcastHint')}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xl font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('ntf.col.title')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.recipients')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.delivered')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.failed')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.date')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.status')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-4">
                  <SkeletonRows />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-4">
                  <QueryError
                    message={t('ntf.loadError')}
                    onRetry={() => refetch()}
                    isFetching={isFetching}
                  />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t('ntf.empty')}
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.broadcastId} className="border-t border-border hover:bg-muted/30">
                  <td className="max-w-xs px-4 py-2">
                    <Link
                      to={`/notifications/${b.broadcastId}`}
                      className="font-medium text-primary"
                    >
                      {b.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{b.message}</p>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{b.recipientCount}</td>
                  <td className="px-4 py-2 text-green-700 dark:text-green-300">
                    {b.deliveredCount}
                  </td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-300">{b.failedCount}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDateTime(b.createdAt, locale)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[b.status]}`}
                    >
                      {t(`ntf.bstatus.${b.status}`, b.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('ntf.totalBroadcasts', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('ntf.prev')}
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('ntf.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
