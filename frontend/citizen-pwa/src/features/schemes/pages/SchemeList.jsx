import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Landmark } from 'lucide-react';
import { SCHEME_CATEGORIES } from '@dgp/shared';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../hooks';

export function SchemeList() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const params = { ...(q ? { q } : {}), ...(category ? { category } : {}) };
  const { data, isLoading, isError } = useSchemes(params);
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
            className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('scheme.list.loadError')}</p>
      ) : schemes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Landmark className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('scheme.list.empty')}</p>
        </div>
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
