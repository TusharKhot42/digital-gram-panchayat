import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { CERT_TYPES, DAKHALA_STATUSES, formatDate } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useApplications } from './hooks';

const LIMIT = 20;

const STATUS_CLASS = {
  Submitted: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  UnderReview: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  Rejected: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
};

export function CertificateList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: LIMIT,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(certificateType ? { certificateType } : {}),
  };
  const { data, isLoading, isError } = useApplications(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-foreground">{t('dakhala.dash.title')}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => onFilter(setQ)(e.target.value)}
            placeholder={t('dakhala.dash.search')}
            className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => onFilter(setStatus)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('dakhala.dash.allStatuses')}</option>
          {DAKHALA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`dakhala.status.${s}`, s)}
            </option>
          ))}
        </select>
        <select
          value={certificateType}
          onChange={(e) => onFilter(setCertificateType)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('dakhala.dash.allTypes')}</option>
          {CERT_TYPES.map((c) => (
            <option key={c} value={c}>
              {t(`dakhala.type.${c}`, c)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('dakhala.dash.application')}</th>
              <th className="px-4 py-2 font-medium">{t('dakhala.dash.type')}</th>
              <th className="px-4 py-2 font-medium">{t('dakhala.dash.date')}</th>
              <th className="px-4 py-2 font-medium">{t('dakhala.dash.status')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-destructive">
                  {t('dakhala.dash.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  {t('dakhala.dash.empty')}
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Link to={`/dakhala/${a.id}`} className="font-medium text-primary">
                      {a.applicationId}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDate(a.createdAt, locale)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status]}`}
                    >
                      {t(`dakhala.status.${a.status}`, a.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('dakhala.dash.total', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('dakhala.dash.prev')}
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
            {t('dakhala.dash.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
