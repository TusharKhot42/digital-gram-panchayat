import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Megaphone } from 'lucide-react';
import { NOTICE_CATEGORIES } from '@dgp/shared';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { EmptyState } from '@/components/EmptyState';
import { NoticeCard } from '../components/NoticeCard';
import { useNotices } from '../hooks';

export function NoticeList() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const params = { ...(q ? { q } : {}), ...(category ? { category } : {}) };
  const { data, isLoading, isError, refetch, isFetching } = useNotices(params);
  const notices = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('notice.list.title')}</h1>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('notice.list.search')}
            aria-label={t('notice.list.search')}
            className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('notice.list.allCategories')}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t('notice.list.allCategories')}</option>
          {NOTICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`notice.category.${c}`, c)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <QueryError
          message={t('notice.list.loadError')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      ) : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title={t('notice.list.empty')} />
      ) : (
        <ul className="space-y-3">
          {notices.map((n) => (
            <li key={n.id}>
              <NoticeCard notice={n} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
