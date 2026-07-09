import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, formatDate } from '@dgp/shared';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useComplaints } from './hooks';

const LIMIT = 20;

export function ComplaintsList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: LIMIT,
    sortBy,
    sortDir,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };
  const { data, isLoading, isError } = useComplaints(params);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const resetPageAnd = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('complaint.list.title')}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => resetPageAnd(setQ)(e.target.value)}
            placeholder={t('complaint.list.search')}
            className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <select
          value={status}
          onChange={(e) => resetPageAnd(setStatus)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('complaint.list.allStatuses')}</option>
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`complaint.status.${s}`, s)}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => resetPageAnd(setCategory)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('complaint.list.allCategories')}</option>
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`complaint.category.${c}`, c)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('complaint.list.id')}</th>
              <th className="px-4 py-2 font-medium">{t('complaint.list.subject')}</th>
              <th className="px-4 py-2 font-medium">
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => toggleSort('category')}
                >
                  {t('complaint.list.category')}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-2 font-medium">
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => toggleSort('status')}
                >
                  {t('complaint.list.status')}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-2 font-medium">
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => toggleSort('createdAt')}
                >
                  {t('complaint.list.date')}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                  {t('complaint.list.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t('complaint.list.empty')}
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Link to={`/complaints/${c.id}`} className="font-medium text-primary">
                      {c.complaintId}
                    </Link>
                  </td>
                  <td className="max-w-xs truncate px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2">{t(`complaint.category.${c.category}`, c.category)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDate(c.createdAt, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('complaint.list.total', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
