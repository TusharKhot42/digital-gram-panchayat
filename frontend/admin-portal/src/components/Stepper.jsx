import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Horizontal progress rail for an application's life cycle.
 *
 * `steps` is the ordered list of stages; `current` is the index reached. A rejected
 * application stops the rail at the stage it died on and marks it in red rather than
 * pretending the remaining stages are still coming.
 */
export function Stepper({ steps, current, failed = false, className, label }) {
  return (
    <ol className={cn('flex items-start', className)} aria-label={label}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isFailure = failed && active;
        const reached = done || active;

        return (
          <li
            key={step.key}
            className={cn('flex min-w-0 flex-1 flex-col items-center', i > 0 && 'relative')}
          >
            {i > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-1/2 top-3.5 h-0.5 w-full',
                  done || active ? (failed ? 'bg-border' : 'bg-primary') : 'bg-border',
                )}
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-caption font-semibold transition-colors duration-150',
                isFailure && 'bg-destructive text-destructive-foreground',
                !isFailure && done && 'bg-primary text-primary-foreground',
                !isFailure &&
                  active &&
                  'bg-primary text-primary-foreground ring-4 ring-primary-subtle',
                !reached && 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
              )}
            >
              {isFailure ? (
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              ) : done ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                i + 1
              )}
            </span>

            <span
              className={cn(
                'mt-2 text-center text-caption leading-tight',
                reached ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
