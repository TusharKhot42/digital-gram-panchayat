import { useTranslation } from 'react-i18next';
import { PAYMENT_STATUS_COLOR_MAP } from '@dgp/shared';
import { cn } from '@/utils/cn';

// Same chip language as StatusBadge — semantic tokens, subtle tint, hairline ring.
const COLOR_CLASSES = {
  red: 'bg-destructive-subtle text-destructive ring-destructive/20',
  orange: 'bg-warning-subtle text-warning ring-warning/20',
  green: 'bg-success-subtle text-success ring-success/20',
};

export function PaymentStatusBadge({ status, className }) {
  const { t } = useTranslation();
  const color = PAYMENT_STATUS_COLOR_MAP[status] || 'red';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ring-1 ring-inset',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {t(`tax.status.${status}`, status)}
    </span>
  );
}
