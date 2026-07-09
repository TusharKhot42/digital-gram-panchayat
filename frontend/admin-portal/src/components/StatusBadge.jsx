import { useTranslation } from 'react-i18next';
import { STATUS_COLOR_MAP } from '@dgp/shared';
import { cn } from '@/utils/cn';

const COLOR_CLASSES = {
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  grey: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
};

export function StatusBadge({ status, className }) {
  const { t } = useTranslation();
  const color = STATUS_COLOR_MAP[status] || 'grey';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {t(`complaint.status.${status}`, status)}
    </span>
  );
}
