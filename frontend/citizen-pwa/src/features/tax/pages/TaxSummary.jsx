import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@dgp/shared';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
import { NoTaxArt } from '@/components/Illustration';
import { Select } from '@/components/ui/input';
import { TaxCard } from '../components/TaxCard';
import { useMyTax } from '../hooks';

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
    <div className="dgp-page-wide">
      <h1 className="mb-5 text-title text-foreground">{t('tax.summary.title')}</h1>

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
          {/* The one number this page exists to answer. */}
          <div
            className={`mb-4 rounded-xl border p-5 text-center sm:mx-auto sm:max-w-md ${
              settled
                ? 'border-success/20 bg-success-subtle'
                : 'border-primary/20 bg-primary-subtle'
            }`}
          >
            <p className="text-label text-muted-foreground">{t('tax.summary.totalDues')}</p>
            <p
              className={`mt-1 text-display tabular-nums ${settled ? 'text-success-strong' : 'text-primary'}`}
            >
              {formatCurrency(totalDues, locale)}
            </p>
            {unbilled ? (
              <p className="mt-1 text-caption text-muted-foreground">
                {t('tax.summary.unbilled', { count: unbilled })}
              </p>
            ) : null}
          </div>

          {years.length > 1 ? (
            <Select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              aria-label={t('tax.summary.allYears')}
              className="mb-4 sm:max-w-xs"
            >
              <option value="">{t('tax.summary.allYears')}</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((r) => (
              <TaxCard key={r.id} record={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
