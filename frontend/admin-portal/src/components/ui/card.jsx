import { cn } from '@/utils/cn';

/**
 * The surface every piece of content sits on. One border, one radius, one shadow —
 * defined here so a card on the tax page and a card on the notice page are the same
 * object, not two things that happen to look alike.
 */
export function Card({ className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        interactive &&
          'transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:translate-y-0',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-4 pb-0', className)} {...props} />;
}

export function CardTitle({ className, as: Tag = 'h2', ...props }) {
  return <Tag className={cn('text-section text-foreground', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-caption text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-2 border-t border-border p-4', className)}
      {...props}
    />
  );
}
