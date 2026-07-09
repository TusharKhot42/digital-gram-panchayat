import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Megaphone } from 'lucide-react';
import { NOTICE_CATEGORIES } from '@dgp/shared';
import { NoticeCard } from '../components/NoticeCard';
import { useNotices } from '../hooks';

export function NoticeList() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const params = { ...(q ? { q } : {}), ...(category ? { category } : {}) };
  const { data, isLoading, isError } = useNotices(params);
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
            className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('notice.list.loadError')}</p>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('notice.list.empty')}</p>
        </div>
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
