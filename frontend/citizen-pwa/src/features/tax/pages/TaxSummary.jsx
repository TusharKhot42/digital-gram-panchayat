import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { TaxMotif } from '@/components/ModuleArt';
import { formatCurrency } from '@dgp/shared';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
import { NoTaxArt } from '@/components/Illustration';
import { Select } from '@/components/ui/input';
import { TaxCard } from '../components/TaxCard';
import { useMyTax } from '../hooks';
import { cn } from '@/utils/cn';

export function TaxSummary() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [financialYear, setFinancialYear] = useState('');

  // Unfiltered fetch to build the year list; filter client-side for a snappy toggle.
  const { data, isLoading, isError, refetch, isFetching } = useMyTax();

  const records = useMemo(() => data?.data ?? [], [data]);
  const years = useMemo(
    () => [...new Set(records.map((r) => r.financialYear))].sort().reverse(),
    [records],
  );

  const filtered = financialYear
    ? records.filter((r) => r.financialYear === financialYear)
    : records;
  const totalDues = filtered.reduce((sum, r) => sum + r.balance, 0);
  /*
   * Records the officer raised from a scanned bill carry no assessed total, so they contribute
   * nothing to this sum. Left alone the page would answer "₹0, all settled" in green to a
   * citizen who owes whatever the bill says — the worst possible wrong answer on this screen.
   */
  const unbilled = filtered.filter((r) => r.amount === null || r.amount === undefined).length;
  const settled = totalDues <= 0 && unbilled === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 space-y-6">
      <ModuleHeader art={TaxMotif} title={t('tax.summary.title')} showBack={false} />

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <QueryError
          message={t('tax.summary.loadError')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      ) : records.length === 0 ? (
        <EmptyState art={NoTaxArt} title={t('tax.summary.empty')} />
      ) : (
        <>
          {/* Outstanding Dues Summary Banner Card */}
          <div
            className={cn(
              'rounded-2xl border p-5 sm:p-6 shadow-sm transition-all',
              settled
                ? 'border-emerald-500/25 bg-emerald-500/10 text-foreground'
                : 'border-primary/25 bg-primary-subtle text-foreground',
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('tax.summary.totalDues')}
                </p>
                <p
                  className={cn(
                    'mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums',
                    settled ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary',
                  )}
                >
                  {formatCurrency(totalDues, locale)}
                </p>
                {unbilled ? (
                  <p className="mt-1 text-caption text-muted-foreground">
                    {t('tax.summary.unbilled', { count: unbilled })}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col sm:items-end gap-2.5">
                {settled ? (
                  <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('tax.card.paidInFull', 'All dues settled')}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {t('tax.summary.paymentDue', 'Payment Due')}
                  </span>
                )}

                {years.length > 1 && (
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {t('tax.form.financialYear', 'Financial Year')}:
                    </span>
                    <Select
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                      aria-label={t('tax.summary.allYears')}
                      className="h-9 w-auto min-w-[130px] text-xs font-medium bg-card"
                    >
                      <option value="">{t('tax.summary.allYears')}</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tax Bills / Ledger Cards */}
          <div
            className={cn(
              'grid gap-5',
              filtered.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2',
            )}
          >
            {filtered.map((r) => (
              <TaxCard key={r.id} record={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
