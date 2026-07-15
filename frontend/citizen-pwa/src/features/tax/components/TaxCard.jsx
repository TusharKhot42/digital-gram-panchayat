import { useTranslation } from 'react-i18next';
import { Home, Droplets, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@dgp/shared';
import { PaymentStatusBadge } from './PaymentStatusBadge';

export function TaxCard({ record }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const Icon = record.taxType === 'Water' ? Droplets : Home;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {t(`tax.type.${record.taxType}`, record.taxType)}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.propertyNumber} · {record.financialYear}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={record.paymentStatus} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">{t('tax.card.assessed')}</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(record.amount, locale)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tax.card.paid')}</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(record.amountPaid, locale)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tax.card.dues')}</p>
          <p className="text-sm font-semibold text-destructive">
            {formatCurrency(record.balance, locale)}
          </p>
        </div>
      </div>

      {record.dueDate ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t('tax.card.dueBy')}: {formatDate(record.dueDate, locale)}
        </p>
      ) : null}

      {record.payments?.length ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold text-foreground">{t('tax.card.history')}</p>
          <ul className="space-y-1">
            {record.payments.map((p, i) => (
              <li
                key={`${p.paidAt}-${i}`}
                className="flex justify-between text-xs text-muted-foreground"
              >
                <span>
                  {formatDate(p.paidAt, locale)}
                  {p.receiptNo ? ` · ${p.receiptNo}` : ''}
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(p.amount, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {record.bills?.length ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold text-foreground">{t('tax.card.bills')}</p>
          <div className="flex flex-wrap gap-2">
            {record.bills.map((b) =>
              b.type === 'image' ? (
                <a key={b.url} href={b.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={b.url}
                    alt={b.name || 'bill'}
                    className="h-16 w-16 rounded-md border border-border object-cover"
                  />
                </a>
              ) : (
                <a
                  key={b.url}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-primary"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {b.name || 'PDF'}
                </a>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
