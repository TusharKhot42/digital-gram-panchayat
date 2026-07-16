import { cn } from '@/utils/cn';

/**
 * The status chip. One shape, one type scale, one ring — the status badges for complaints,
 * certificates and tax payments all render through this rather than each restating the
 * classes.
 *
 * Text uses the `-strong` token rather than the base colour: the mandated palette's mid
 * tones (notably warning #F59E0B at 2.1:1) don't clear WCAG AA as text on their subtle
 * backgrounds, so fills use the base token and text uses the darkened pair.
 */
export const CHIP_COLOR_CLASSES = {
  red: 'bg-destructive-subtle text-destructive-strong ring-destructive/20',
  orange: 'bg-warning-subtle text-warning-strong ring-warning/30',
  green: 'bg-success-subtle text-success-strong ring-success/20',
  blue: 'bg-info-subtle text-info-strong ring-info/20',
  grey: 'bg-muted text-body-foreground ring-border',
};

export function Chip({ color = 'grey', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ring-1 ring-inset',
        CHIP_COLOR_CLASSES[color] ?? CHIP_COLOR_CLASSES.grey,
        className,
      )}
      {...props}
    />
  );
}
