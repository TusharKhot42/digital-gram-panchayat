import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { Timeline } from '@/components/Timeline';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { useTaxRecord, useTaxMutations } from './hooks';

/** One figure in the assessed/paid/balance strip. */
function Figure({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'text-foreground',
    paid: 'text-success-strong',
    due: 'text-destructive-strong',
  }[tone];

  return (
    <div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className={`text-title tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

export function TaxDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: r, isLoading, isError } = useTaxRecord(id);
  const m = useTaxMutations(id);

  const [amount, setAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [receiptNo, setReceiptNo] = useState('');

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !r)
    return <p className="text-body text-destructive-strong">{t('tax.detail.notFound')}</p>;

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

  const settled = r.balance <= 0;

  return (
    <div>
      <PageHeader
        backTo="/tax"
        backLabel={t('tax.detail.back')}
        title={t(`tax.type.${r.taxType}`, r.taxType)}
        subtitle={`${r.taxRecordId} · ${r.propertyNumber} · ${r.financialYear}`}
        action={<PaymentStatusBadge status={r.paymentStatus} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="grid grid-cols-3 gap-4 p-5">
              <Figure label={t('tax.card.assessed')} value={formatCurrency(r.amount, locale)} />
              <Figure
                label={t('tax.card.paid')}
                value={formatCurrency(r.amountPaid, locale)}
                tone="paid"
              />
              <Figure
                label={t('tax.card.dues')}
                value={formatCurrency(r.balance, locale)}
                tone={settled ? 'paid' : 'due'}
              />
            </CardContent>
          </Card>

          <Card>
            <h2 className="border-b border-border px-5 py-3 text-section text-foreground">
              {t('tax.detail.payments')}
            </h2>
            {r.payments?.length ? (
              <Table>
                <THead className="static">
                  <tr>
                    <TH>{t('tax.detail.date')}</TH>
                    <TH>{t('tax.detail.receipt')}</TH>
                    <TH className="text-right">{t('tax.detail.amount')}</TH>
                  </tr>
                </THead>
                <TBody>
                  {r.payments.map((p, i) => (
                    <TR key={`${p.paidAt}-${i}`}>
                      <TD className="whitespace-nowrap">{formatDateTime(p.paidAt, locale)}</TD>
                      <TD className="text-muted-foreground">{p.receiptNo || '—'}</TD>
                      <TD className="text-right font-medium tabular-nums">
                        {formatCurrency(p.amount, locale)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            ) : (
              <CardContent className="p-5">
                <p className="text-body text-muted-foreground">{t('tax.detail.noPayments')}</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <h2 className="border-b border-border px-5 py-3 text-section text-foreground">
              {t('tax.detail.auditTimeline')}
            </h2>
            <CardContent className="p-5">
              <Timeline
                items={[...r.history].reverse().map((h, i) => ({
                  key: `${h.at}-${i}`,
                  title: `${t(`tax.action.${h.action}`, h.action)}${h.field ? ` · ${h.field}` : ''}${
                    h.old != null || h.new != null ? `: ${h.old ?? '—'} → ${h.new ?? '—'}` : ''
                  }`,
                  meta: formatDateTime(h.at, locale),
                }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <form onSubmit={recordPayment}>
              <h2 className="border-b border-border px-5 py-3 text-section text-foreground">
                {t('tax.detail.recordPayment')}
              </h2>
              <CardContent className="space-y-2.5 p-5">
                <Input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={t('tax.detail.amount')}
                  aria-label={t('tax.detail.amount')}
                />
                <Input
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder={t('tax.detail.receiptNo')}
                  aria-label={t('tax.detail.receiptNo')}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={m.addPayment.isPending}
                  disabled={settled}
                >
                  {settled ? t('tax.detail.fullyPaid') : t('tax.detail.addPayment')}
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card>
            <form onSubmit={saveAmount}>
              <h2 className="border-b border-border px-5 py-3 text-section text-foreground">
                {t('tax.detail.updateAmount')}
              </h2>
              <CardContent className="space-y-2.5 p-5">
                <Input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(r.amount)}
                  aria-label={t('tax.detail.updateAmount')}
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  loading={m.update.isPending}
                >
                  {t('tax.detail.saveAmount')}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
