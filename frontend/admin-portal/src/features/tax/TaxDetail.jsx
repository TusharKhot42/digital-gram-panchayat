import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useTaxRecord, useTaxMutations } from './hooks';

const STATUS_CLASS = {
  Unpaid: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  Partial: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
};

export function TaxDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: r, isLoading, isError } = useTaxRecord(id);
  const m = useTaxMutations(id);

  const [amount, setAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [receiptNo, setReceiptNo] = useState('');

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !r) return <p className="text-sm text-destructive">{t('tax.detail.notFound')}</p>;

  const saveAmount = async (e) => {
    e.preventDefault();
    if (amount === '') return;
    try {
      await m.update.mutateAsync({ amount: Number(amount) });
      toast.success(t('tax.detail.updated'));
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('tax.detail.updateFailed'));
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (payAmount === '') return;
    try {
      await m.addPayment.mutateAsync({
        amount: Number(payAmount),
        receiptNo: receiptNo || undefined,
      });
      toast.success(t('tax.detail.paymentRecorded'));
      setPayAmount('');
      setReceiptNo('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('tax.detail.paymentFailed'));
    }
  };

  const input =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div>
      <Link to="/tax" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t('tax.detail.back')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {t(`tax.type.${r.taxType}`, r.taxType)}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {r.taxRecordId} · {r.propertyNumber} · {r.financialYear}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[r.paymentStatus]}`}
              >
                {t(`tax.status.${r.paymentStatus}`, r.paymentStatus)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">{t('tax.card.assessed')}</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(r.amount, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('tax.card.paid')}</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(r.amountPaid, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('tax.card.dues')}</p>
                <p className="text-lg font-semibold text-destructive">
                  {formatCurrency(r.balance, locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('tax.detail.payments')}
            </h2>
            {r.payments?.length ? (
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-1 font-medium">{t('tax.detail.date')}</th>
                    <th className="py-1 font-medium">{t('tax.detail.receipt')}</th>
                    <th className="py-1 text-right font-medium">{t('tax.detail.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.payments.map((p, i) => (
                    <tr key={`${p.paidAt}-${i}`} className="border-t border-border">
                      <td className="py-1.5">{formatDateTime(p.paidAt, locale)}</td>
                      <td className="py-1.5 text-muted-foreground">{p.receiptNo || '—'}</td>
                      <td className="py-1.5 text-right font-medium">
                        {formatCurrency(p.amount, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">{t('tax.detail.noPayments')}</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('tax.detail.auditTimeline')}
            </h2>
            <ol className="space-y-3">
              {[...r.history].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-foreground">
                      {t(`tax.action.${h.action}`, h.action)}
                      {h.field ? ` · ${h.field}` : ''}
                      {h.old != null || h.new != null ? `: ${h.old ?? '—'} → ${h.new ?? '—'}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.at, locale)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <form onSubmit={recordPayment} className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('tax.detail.recordPayment')}
            </h2>
            <input
              type="number"
              min="1"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder={t('tax.detail.amount')}
              className={`mb-2 ${input}`}
            />
            <input
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder={t('tax.detail.receiptNo')}
              className={`mb-3 ${input}`}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={m.addPayment.isPending || r.balance <= 0}
            >
              {r.balance <= 0 ? t('tax.detail.fullyPaid') : t('tax.detail.addPayment')}
            </Button>
          </form>

          <form onSubmit={saveAmount} className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('tax.detail.updateAmount')}
            </h2>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(r.amount)}
              className={`mb-3 ${input}`}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={m.update.isPending}
            >
              {t('tax.detail.saveAmount')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
