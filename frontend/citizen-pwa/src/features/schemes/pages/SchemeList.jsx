import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Landmark } from 'lucide-react';
import { SCHEME_CATEGORIES } from '@dgp/shared';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../hooks';

export function SchemeList() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const params = { ...(q ? { q } : {}), ...(category ? { category } : {}) };
  const { data, isLoading, isError, refetch, isFetching } = useSchemes(params);
  const schemes = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('scheme.list.title')}</h1>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('scheme.list.search')}
            aria-label={t('scheme.list.search')}
            className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('scheme.list.allCategories')}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t('scheme.list.allCategories')}</option>
          {SCHEME_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`scheme.category.${c}`, c)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <QueryError
          message={t('scheme.list.loadError')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      ) : schemes.length === 0 ? (
        <EmptyState icon={Landmark} title={t('scheme.list.empty')} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {schemes.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      )}
    </div>
  );
}
