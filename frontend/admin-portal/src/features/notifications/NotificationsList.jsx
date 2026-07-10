import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Send, RotateCw } from 'lucide-react';
import {
  NOTIFICATION_STATUSES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_MODULES,
  formatDateTime,
} from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useNotifications, useNotificationStats, useNotificationMutations } from './hooks';

const LIMIT = 20;

const STATUS_CLASS = {
  queued: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function NotificationsList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [module, setModule] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: LIMIT,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {}),
    ...(module ? { module } : {}),
  };
  const { data, isLoading, isError } = useNotifications(params);
  const { data: stats } = useNotificationStats();
  const m = useNotificationMutations();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const retry = async (id) => {
    try {
      await m.retry.mutateAsync(id);
      toast.success(t('ntf.retried'));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('ntf.actionFailed'));
    }
  };

  const statCards = [
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

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xl font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => onFilter(setQ)(e.target.value)}
            placeholder={t('ntf.search')}
            className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onFilter(setStatus)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('ntf.allStatuses')}</option>
          {NOTIFICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`ntf.status.${s}`, s)}
            </option>
          ))}
        </select>
        <select
          value={channel}
          onChange={(e) => onFilter(setChannel)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('ntf.allChannels')}</option>
          {NOTIFICATION_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={module}
          onChange={(e) => onFilter(setModule)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('ntf.allModules')}</option>
          {NOTIFICATION_MODULES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('ntf.col.title')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.module')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.channel')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.date')}</th>
              <th className="px-4 py-2 font-medium">{t('ntf.col.status')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('ntf.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                  {t('ntf.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t('ntf.empty')}
                </td>
              </tr>
            ) : (
              rows.map((n) => (
                <tr key={n.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Link to={`/notifications/${n.id}`} className="font-medium text-primary">
                      {n.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{n.module}</td>
                  <td className="px-4 py-2 text-muted-foreground">{n.channel}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDateTime(n.createdAt, locale)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[n.status]}`}
                    >
                      {t(`ntf.status.${n.status}`, n.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {n.status === 'failed' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('ntf.retry')}
                        onClick={() => retry(n.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('ntf.total', { total })}</span>
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
