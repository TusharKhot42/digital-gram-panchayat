import { useTranslation } from 'react-i18next';
import { STATUS_COLOR_MAP } from '@dgp/shared';
import { Chip } from '@/components/ui/chip';

/** Complaint status chip (Red Pending, Orange InProgress, Green Resolved). */
export function StatusBadge({ status, className }) {
  const { t } = useTranslation();
  return (
    <Chip color={STATUS_COLOR_MAP[status] || 'grey'} className={className}>
      {t(`complaint.status.${status}`, status)}
    </Chip>
  );
}
