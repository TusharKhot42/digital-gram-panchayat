import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Bell } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { SkeletonRows } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import {
  TableShell,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TableMessageRow,
} from '@/components/ui/table';
import { useBroadcasts, useNotificationStats } from './hooks';

const LIMIT = 20;
const COLS = 6;

/** Delivery outcome → chip colour. */
const STATUS_COLOR = {
  queued: 'blue',
  delivered: 'green',
  partial: 'orange',
  failed: 'red',
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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-title text-foreground">{t('ntf.title')}</h1>
        <Button asChild size="sm">
          <Link to="/notifications/broadcast">
            <Send className="h-4 w-4" aria-hidden="true" />
            {t('ntf.broadcast')}
          </Link>
        </Button>
      </div>

      <p className="mb-4 text-body text-muted-foreground">{t('ntf.broadcastHint')}</p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-border bg-card p-3 text-center shadow-xs"
          >
            <p className="text-title tabular-nums text-foreground">{c.value}</p>
            <p className="text-caption text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <TableShell className="max-h-[calc(100dvh-22rem)] overflow-y-auto">
        <Table>
          <THead>
            <tr>
              <TH>{t('ntf.col.title')}</TH>
              <TH className="text-right">{t('ntf.col.recipients')}</TH>
              <TH className="text-right">{t('ntf.col.delivered')}</TH>
              <TH className="text-right">{t('ntf.col.failed')}</TH>
              <TH>{t('ntf.col.date')}</TH>
              <TH>{t('ntf.col.status')}</TH>
            </tr>
          </THead>
          <TBody>
            {isLoading ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <SkeletonRows />
              </TableMessageRow>
            ) : isError ? (
              <TableMessageRow colSpan={COLS} className="py-4">
                <QueryError
                  message={t('ntf.loadError')}
                  onRetry={() => refetch()}
                  isFetching={isFetching}
                />
              </TableMessageRow>
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={COLS} className="p-0">
                <EmptyState
                  icon={Bell}
                  title={t('ntf.empty')}
                  className="border-0 shadow-none"
                  action={
                    <Button asChild size="sm">
                      <Link to="/notifications/broadcast">{t('ntf.broadcast')}</Link>
                    </Button>
                  }
                />
              </TableMessageRow>
            ) : (
              rows.map((b) => (
                <TR key={b.broadcastId}>
                  <TD className="max-w-xs">
                    <Link
                      to={`/notifications/${b.broadcastId}`}
                      className="font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
                    >
                      {b.title}
                    </Link>
                    <p className="truncate text-caption text-muted-foreground">{b.message}</p>
                  </TD>
                  <TD className="text-right tabular-nums text-muted-foreground">
                    {b.recipientCount}
                  </TD>
                  <TD className="text-right tabular-nums text-success-strong">
                    {b.deliveredCount}
                  </TD>
                  <TD
                    className={`text-right tabular-nums ${
                      b.failedCount > 0 ? 'text-destructive-strong' : 'text-muted-foreground'
                    }`}
                  >
                    {b.failedCount}
                  </TD>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(b.createdAt, locale)}
                  </TD>
                  <TD>
                    <Chip color={STATUS_COLOR[b.status] ?? 'grey'}>
                      {t(`ntf.bstatus.${b.status}`, b.status)}
                    </Chip>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableShell>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        totalLabel={t('ntf.totalBroadcasts', { total })}
      />
    </div>
  );
}
