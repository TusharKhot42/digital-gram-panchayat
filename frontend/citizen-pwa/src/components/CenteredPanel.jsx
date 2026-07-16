import { cn } from '@/utils/cn';

/**
 * The full-height, centred column used by screens that stand alone outside the app shell:
 * login, register, offline, 404. They were each centring themselves with slightly different
 * padding and max-widths; this makes the vertical rhythm identical across all four.
 */
export function CenteredPanel({ children, className }) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Icon + headline + copy + action, for the states where nothing else is on screen. */
export function StatusPanel({ icon: Icon, title, description, action, tone = 'muted' }) {
  const discClass = {
    muted: 'bg-secondary text-muted-foreground',
    brand: 'bg-primary-subtle text-primary',
    warning: 'bg-warning-subtle text-warning-strong',
  }[tone];

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {Icon ? (
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', discClass)}>
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      ) : null}
      <h1 className="text-display text-foreground">{title}</h1>
      {description ? (
        <p className="max-w-xs text-body text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
