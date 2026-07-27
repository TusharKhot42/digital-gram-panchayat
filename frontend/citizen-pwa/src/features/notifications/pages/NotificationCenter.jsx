import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Search, CheckCheck, Settings, X } from 'lucide-react';
import { formatDateTime, pickLocale } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';
import { useNotifications, useMarkAllRead } from '../hooks';

const TYPE_DOT = {
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

const GROUPS = ['today', 'yesterday', 'older'];

/** Which day bucket a timestamp falls into, by local calendar day rather than elapsed hours. */
function bucketOf(iso) {
  const then = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (then >= startOfToday) return 'today';
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  return then >= startOfYesterday ? 'yesterday' : 'older';
}

/** Split a list into today/yesterday/older, dropping buckets that ended up empty. */
function groupByDay(items) {
  const buckets = { today: [], yesterday: [], older: [] };
  for (const n of items) buckets[bucketOf(n.createdAt)].push(n);
  return GROUPS.map((key) => ({ key, items: buckets[key] })).filter((g) => g.items.length);
}

function NotificationRow({ n, locale, t }) {
  const unread = !n.readAt;
  return (
    <li>
      <Link
        to={`/notifications/${n.id}`}
        className={cn(
          'flex min-h-11 items-start gap-2.5 px-3 py-3 transition-colors duration-150 hover:bg-muted/40',
          unread && 'bg-primary-subtle/40',
        )}
      >
        <span
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            TYPE_DOT[n.type] || 'bg-muted-foreground',
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-body text-foreground',
              unread ? 'font-semibold' : 'font-medium',
            )}
          >
            {pickLocale(n.i18n, 'title', locale, n.title)}
          </p>
          <p className="line-clamp-2 text-caption text-muted-foreground">
            {pickLocale(n.i18n, 'message', locale, n.message)}
          </p>
          <p className="mt-1 text-caption text-muted-foreground">
            {formatDateTime(n.createdAt, locale)}
          </p>
        </div>
        {unread ? (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-label={t('notif.unreadSection')}
          />
        ) : null}
      </Link>
    </li>
  );
}

/** A day bucket rendered as one card with a sticky-free heading above it. */
function DayGroup({ group, locale, t }) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="mb-1.5 px-1 text-label uppercase tracking-wide text-muted-foreground">
        {t(`notif.group.${group.key}`)}
      </h3>
      <Card>
        <ul className="divide-y divide-border">
          {group.items.map((n) => (
            <NotificationRow key={n.id} n={n} locale={locale} t={t} />
          ))}
        </ul>
      </Card>
    </section>
  );
}

export function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = { ...(q ? { q } : {}), ...(unreadOnly ? { unread: 'true' } : {}) };
  const { data, isLoading, isError } = useNotifications(params);
  const markAll = useMarkAllRead();

  const items = useMemo(() => data?.data ?? [], [data]);

  // Unread first as its own block, then everything already read grouped by day — so the
  // things needing attention are never buried under yesterday's read items.
  const { unread, readGroups } = useMemo(
    () => ({
      unread: items.filter((n) => !n.readAt),
      readGroups: groupByDay(items.filter((n) => n.readAt)),
    }),
    [items],
  );

  const unreadCount = unread.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-title text-foreground">{t('notif.title')}</h1>
          {unreadCount ? (
            <p className="mt-1 text-caption text-muted-foreground">
              {t('notif.unreadCount', { count: unreadCount })}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {t('notif.markAll')}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={t('notif.settings')}>
            <Link to="/notifications/settings">
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-5 space-y-2.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('notif.search')}
            aria-label={t('notif.search')}
            className="pl-9 pr-9"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label={t('notif.clearSearch')}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <label className="flex min-h-11 items-center gap-2 text-body text-foreground">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          {t('notif.unreadOnly')}
        </label>
      </div>

      {isLoading ? (
        <p className="text-body text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-body text-destructive-strong">{t('notif.loadError')}</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={q || unreadOnly ? t('notif.emptyFiltered') : t('notif.empty')}
          action={
            q || unreadOnly ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQ('');
                  setUnreadOnly(false);
                }}
              >
                {t('notif.clearSearch')}
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {unreadCount ? (
            <section>
              <h2 className="mb-1.5 px-1 text-label uppercase tracking-wide text-primary">
                {t('notif.unreadSection')}
              </h2>
              <Card>
                <ul className="divide-y divide-border">
                  {unread.map((n) => (
                    <NotificationRow key={n.id} n={n} locale={locale} t={t} />
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {readGroups.length ? (
            <div className={cn(unreadCount && 'mt-6')}>
              {unreadCount ? (
                <h2 className="mb-1.5 px-1 text-label uppercase tracking-wide text-muted-foreground">
                  {t('notif.readSection')}
                </h2>
              ) : null}
              {readGroups.map((g) => (
                <DayGroup key={g.key} group={g} locale={locale} t={t} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
