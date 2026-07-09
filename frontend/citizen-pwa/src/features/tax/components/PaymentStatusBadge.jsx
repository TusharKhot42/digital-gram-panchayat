import { useTranslation } from 'react-i18next';
import { PAYMENT_STATUS_COLOR_MAP } from '@dgp/shared';
import { cn } from '@/utils/cn';

const COLOR_CLASSES = {
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
};

export function PaymentStatusBadge({ status, className }) {
  const { t } = useTranslation();
  const color = PAYMENT_STATUS_COLOR_MAP[status] || 'red';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {t(`tax.status.${status}`, status)}
    </span>
  );
}
