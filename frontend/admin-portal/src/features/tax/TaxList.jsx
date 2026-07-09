import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { TAX_TYPES, PAYMENT_STATUSES, formatCurrency } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useTaxRecords } from './hooks';

const LIMIT = 20;

const STATUS_CLASS = {
  Unpaid: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  Partial: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
};

export function TaxList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [q, setQ] = useState('');
  const [taxType, setTaxType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: LIMIT,
    ...(q ? { q } : {}),
    ...(taxType ? { taxType } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  };
  const { data, isLoading, isError } = useTaxRecords(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const onFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('tax.dash.title')}</h1>
        <Button asChild size="sm">
          <Link to="/tax/new">
            <Plus className="h-4 w-4" />
            {t('tax.dash.new')}
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => onFilter(setQ)(e.target.value)}
            placeholder={t('tax.dash.search')}
            className="h-9 w-60 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={taxType}
          onChange={(e) => onFilter(setTaxType)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('tax.dash.allTypes')}</option>
          {TAX_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {t(`tax.type.${tp}`, tp)}
            </option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => onFilter(setPaymentStatus)(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">{t('tax.dash.allStatuses')}</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tax.status.${s}`, s)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">{t('tax.dash.record')}</th>
              <th className="px-4 py-2 font-medium">{t('tax.dash.type')}</th>
              <th className="px-4 py-2 font-medium">{t('tax.dash.year')}</th>
              <th className="px-4 py-2 font-medium">{t('tax.dash.amount')}</th>
              <th className="px-4 py-2 font-medium">{t('tax.dash.dues')}</th>
              <th className="px-4 py-2 font-medium">{t('tax.dash.status')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t('common.loading')}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                  {t('tax.dash.loadError')}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t('tax.dash.empty')}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Link to={`/tax/${r.id}`} className="font-medium text-primary">
                      {r.taxRecordId}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.propertyNumber}</p>
                  </td>
                  <td className="px-4 py-2">{t(`tax.type.${r.taxType}`, r.taxType)}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.financialYear}</td>
                  <td className="px-4 py-2">{formatCurrency(r.amount, locale)}</td>
                  <td className="px-4 py-2 font-medium">{formatCurrency(r.balance, locale)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[r.paymentStatus]}`}
                    >
                      {t(`tax.status.${r.paymentStatus}`, r.paymentStatus)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('tax.dash.total', { total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('tax.dash.prev')}
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
            {t('tax.dash.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
