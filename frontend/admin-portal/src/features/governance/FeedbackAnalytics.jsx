import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { formatDate } from '@dgp/shared';
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
import { QueryError } from '@/components/QueryError';
import { useAdminFeedback, useFeedbackAnalytics } from './hooks';

/** A 1-5 average drawn as a proportion of the bar, so the eye reads it before the number. */
function RatingBar({ average }) {
  const pct = average ? (average / 5) * 100 : 0;
  return (
    <div className="h-2 w-full min-w-16 overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function FeedbackAnalytics() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: analytics, isLoading, isError, refetch } = useFeedbackAnalytics(6);
  const { data: entries } = useAdminFeedback();

  const rows = analytics?.byCategory ?? [];
  const trend = analytics?.trend ?? [];
  const overall = analytics?.overall;
  const maxCount = Math.max(1, ...trend.map((m) => m.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title text-foreground">{t('gov.feedback.title')}</h1>
        <p className="mt-0.5 text-caption text-muted-foreground">{t('gov.feedback.intro')}</p>
      </div>

      {overall?.count ? (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-xs">
          <span className="flex items-center gap-2">
            <Star className="h-6 w-6 fill-warning text-warning" aria-hidden="true" />
            <span className="text-display tabular-nums text-foreground">{overall.average}</span>
          </span>
          <span className="text-body text-muted-foreground">
            {t('gov.feedback.overall', { count: overall.count })}
          </span>
        </div>
      ) : null}

      <section aria-labelledby="cat-h">
        <h2 id="cat-h" className="mb-2 text-section text-foreground">
          {t('gov.feedback.byService')}
        </h2>
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>{t('gov.feedback.service')}</TH>
                <TH>{t('gov.feedback.average')}</TH>
                <TH className="w-1/3"> </TH>
                <TH>{t('gov.feedback.responses')}</TH>
              </TR>
            </THead>
            <TBody>
              {isLoading ? (
                <TableMessageRow colSpan={4}>{t('common.loading')}</TableMessageRow>
              ) : isError ? (
                <TableMessageRow colSpan={4}>
                  <QueryError message={t('gov.feedback.loadError')} onRetry={refetch} />
                </TableMessageRow>
              ) : (
                rows.map((r) => (
                  <TR key={r.category}>
                    <TD>{t(`gov.feedback.category.${r.category}`, r.category)}</TD>
                    <TD className="tabular-nums">
                      {/* No ratings is not a zero rating. */}
                      {r.average == null ? (
                        <span className="text-muted-foreground">{t('gov.feedback.noScore')}</span>
                      ) : (
                        r.average
                      )}
                    </TD>
                    <TD>
                      <RatingBar average={r.average} />
                    </TD>
                    <TD className="tabular-nums">{r.count}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </TableShell>
      </section>

      <section aria-labelledby="trend-h">
        <h2 id="trend-h" className="mb-2 text-section text-foreground">
          {t('gov.feedback.trend')}
        </h2>
        {trend.length ? (
          <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
            {/* A plain bar row rather than a chart library — six months of counts does not
                justify pulling recharts into this screen's bundle. */}
            <ul className="flex items-end gap-3">
              {trend.map((m) => (
                <li key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <span className="text-caption tabular-nums text-foreground">{m.average}</span>
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${Math.max(4, (m.count / maxCount) * 96)}px` }}
                    role="img"
                    aria-label={t('gov.feedback.trendBar', {
                      month: m.month,
                      average: m.average,
                      count: m.count,
                    })}
                  />
                  <span className="truncate text-caption text-muted-foreground">{m.month}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-body text-muted-foreground">
            {t('gov.feedback.noTrend')}
          </p>
        )}
      </section>

      <section aria-labelledby="entries-h">
        <h2 id="entries-h" className="mb-2 text-section text-foreground">
          {t('gov.feedback.entries')}
        </h2>
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>{t('gov.feedback.service')}</TH>
                <TH>{t('gov.feedback.rating')}</TH>
                <TH>{t('gov.feedback.comment')}</TH>
                <TH>{t('gov.feedback.from')}</TH>
                <TH>{t('gov.feedback.when')}</TH>
              </TR>
            </THead>
            <TBody>
              {entries?.data?.length ? (
                entries.data.map((f) => (
                  <TR key={f.id}>
                    <TD>{t(`gov.feedback.category.${f.category}`, f.category)}</TD>
                    <TD className="tabular-nums">{f.rating}</TD>
                    <TD>{f.comment || '—'}</TD>
                    {/* The API withholds the name on an anonymous entry; nothing to show here. */}
                    <TD>{f.isAnonymous ? t('gov.feedback.anonymous') : (f.citizenName ?? '—')}</TD>
                    <TD className="whitespace-nowrap">{formatDate(f.createdAt, locale)}</TD>
                  </TR>
                ))
              ) : (
                <TableMessageRow colSpan={5}>{t('gov.feedback.noEntries')}</TableMessageRow>
              )}
            </TBody>
          </Table>
        </TableShell>
      </section>
    </div>
  );
}
