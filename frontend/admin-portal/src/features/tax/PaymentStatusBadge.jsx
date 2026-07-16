import { useTranslation } from 'react-i18next';
import { PAYMENT_STATUS_COLOR_MAP } from '@dgp/shared';
import { Chip } from '@/components/ui/chip';

/** Tax payment status chip. */
export function PaymentStatusBadge({ status, className }) {
  const { t } = useTranslation();
  return (
    <Chip color={PAYMENT_STATUS_COLOR_MAP[status] || 'red'} className={className}>
      {t(`tax.status.${status}`, status)}
    </Chip>
  );
}
