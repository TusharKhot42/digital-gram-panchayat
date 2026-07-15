import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Search, CheckCheck, Settings } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useNotifications, useMarkAllRead } from '../hooks';

const TYPE_DOT = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500',
};

export function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = { ...(q ? { q } : {}), ...(unreadOnly ? { unread: 'true' } : {}) };
  const { data, isLoading, isError } = useNotifications(params);
  const markAll = useMarkAllRead();

  const items = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('notif.title')}</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            {t('notif.markAll')}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={t('notif.settings')}>
            <Link to="/notifications/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('notif.search')}
            className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          {t('notif.unreadOnly')}
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('notif.loadError')}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('notif.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                to={`/notifications/${n.id}`}
                className={cn(
                  'block rounded-lg border border-border p-3',
                  n.readAt ? 'bg-card' : 'bg-primary/5',
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      TYPE_DOT[n.type] || 'bg-muted-foreground',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm',
                        n.readAt ? 'font-medium text-foreground' : 'font-semibold text-foreground',
                      )}
                    >
                      {pickLocale(n.i18n, 'title', locale, n.title)}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {pickLocale(n.i18n, 'message', locale, n.message)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDateTime(n.createdAt, locale)}
                    </p>
                  </div>
                  {!n.readAt ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
