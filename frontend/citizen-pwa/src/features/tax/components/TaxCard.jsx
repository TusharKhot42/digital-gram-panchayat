import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Droplets, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@dgp/shared';
import { Lightbox } from '@/components/Lightbox';
import { PaymentStatusBadge } from './PaymentStatusBadge';

/**
 * A tax record drawn as a demand bill rather than a generic card: a titled header strip,
 * a ruled assessed/paid/balance ledger, then the payment history beneath — the shape a
 * citizen already recognises from a paper panchayat bill.
 */
export function TaxCard({ record }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [receipt, setReceipt] = useState(null);

  const Icon = record.taxType === 'Water' ? Droplets : Home;
  const settled = record.balance <= 0;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      {/* Bill header strip */}
      <header className="flex items-start justify-between gap-2 border-b border-border bg-secondary px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-foreground">
              {t(`tax.type.${record.taxType}`, record.taxType)}
            </p>
            <p className="truncate text-caption text-muted-foreground">
              {t('tax.card.billNo')} {record.propertyNumber} · {record.financialYear}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={record.paymentStatus} />
      </header>

      {/* Ledger */}
      <dl className="divide-y divide-border">
        <div className="flex items-baseline justify-between px-4 py-2.5">
          <dt className="text-body text-muted-foreground">{t('tax.card.assessed')}</dt>
          <dd className="text-body tabular-nums text-foreground">
            {formatCurrency(record.amount, locale)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between px-4 py-2.5">
          <dt className="text-body text-muted-foreground">{t('tax.card.paid')}</dt>
          <dd className="text-body tabular-nums text-success-strong">
            − {formatCurrency(record.amountPaid, locale)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between bg-secondary/60 px-4 py-3">
          <dt className="text-section text-foreground">{t('tax.card.dues')}</dt>
          <dd
            className={`text-title tabular-nums ${settled ? 'text-success-strong' : 'text-destructive-strong'}`}
          >
            {formatCurrency(record.balance, locale)}
          </dd>
        </div>
      </dl>

      {record.dueDate && !settled ? (
        <p className="border-t border-border px-4 py-2 text-caption text-muted-foreground">
          {t('tax.card.dueBy')}: {formatDate(record.dueDate, locale)}
        </p>
      ) : null}

      {settled ? (
        <p className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-caption font-medium text-success-strong">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('tax.card.paidInFull')}
        </p>
      ) : null}

      {/* Payment history, as a dated timeline rather than a flat list */}
      <section className="border-t border-border px-4 py-3">
        <h3 className="mb-2 text-label text-foreground">{t('tax.card.history')}</h3>
        {record.payments?.length ? (
          <ol className="space-y-2.5">
            {record.payments.map((p, i) => {
              const last = i === record.payments.length - 1;
              return (
                <li key={`${p.paidAt}-${i}`} className="flex gap-2.5">
                  <div className="flex flex-col items-center" aria-hidden="true">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-success" />
                    {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                  </div>
                  <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-body text-foreground">
                        {formatDate(p.paidAt, locale)}
                      </span>
                      {p.receiptNo ? (
                        <span className="block truncate text-caption text-muted-foreground">
                          {t('tax.card.receipt')} {p.receiptNo}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-body font-medium tabular-nums text-foreground">
                      {formatCurrency(p.amount, locale)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-caption text-muted-foreground">{t('tax.card.noPayments')}</p>
        )}
      </section>

      {/* Scanned bills / receipts */}
      {record.bills?.length ? (
        <section className="border-t border-border px-4 py-3">
          <h3 className="mb-2 text-label text-foreground">{t('tax.card.bills')}</h3>
          <div className="flex flex-wrap gap-2">
            {record.bills.map((b) =>
              b.type === 'image' ? (
                <button
                  key={b.url}
                  type="button"
                  onClick={() => setReceipt(b.url)}
                  aria-label={t('tax.card.viewBill')}
                  className="overflow-hidden rounded-md border border-border transition-opacity duration-150 hover:opacity-90"
                >
                  <img src={b.url} alt="" className="h-16 w-16 object-cover" />
                </button>
              ) : (
                <a
                  key={b.url}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-body font-medium text-primary transition-colors duration-150 hover:bg-muted/40"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {b.name || 'PDF'}
                </a>
              ),
            )}
          </div>
        </section>
      ) : null}

      <Lightbox src={receipt} label={t('tax.card.receipt')} onClose={() => setReceipt(null)} />
    </article>
  );
}
