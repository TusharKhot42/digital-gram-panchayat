import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react';
import { formatCurrency } from '@dgp/shared';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
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

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('tax.summary.title')}</h1>

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <QueryError
          message={t('tax.summary.loadError')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      ) : records.length === 0 ? (
        <EmptyState icon={Receipt} title={t('tax.summary.empty')} />
      ) : (
        <>
          <div className="mb-4 rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('tax.summary.totalDues')}</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalDues, locale)}</p>
          </div>

          {years.length > 1 ? (
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="mb-4 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('tax.summary.allYears')}</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          ) : null}

          <div className="space-y-3">
            {filtered.map((r) => (
              <TaxCard key={r.id} record={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
