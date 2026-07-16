import { useTranslation } from 'react-i18next';
import { DAKHALA_STATUS_COLOR_MAP } from '@dgp/shared';
import { Chip } from '@/components/ui/chip';

/** Certificate application status chip. */
export function DakhalaStatusBadge({ status, className }) {
  const { t } = useTranslation();
  return (
    <Chip color={DAKHALA_STATUS_COLOR_MAP[status] || 'grey'} className={className}>
      {t(`dakhala.status.${status}`, status)}
    </Chip>
  );
}
