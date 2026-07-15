import { useTranslation } from 'react-i18next';
import { STATUS_COLOR_MAP } from '@dgp/shared';
import { cn } from '@/utils/cn';

// Blueprint 3.1.1 colour map (Red Pending, Orange InProgress, Green Resolved) rendered with
// the design-system semantic tokens: a subtle tint, readable text, and a hairline ring so the
// chip stays legible on white cards and in dark mode alike.
const COLOR_CLASSES = {
  red: 'bg-destructive-subtle text-destructive ring-destructive/20',
  orange: 'bg-warning-subtle text-warning ring-warning/20',
  green: 'bg-success-subtle text-success ring-success/20',
  grey: 'bg-muted text-muted-foreground ring-border',
};

export function StatusBadge({ status, className }) {
  const { t } = useTranslation();
  const color = STATUS_COLOR_MAP[status] || 'grey';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ring-1 ring-inset',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {t(`complaint.status.${status}`, status)}
    </span>
  );
}
