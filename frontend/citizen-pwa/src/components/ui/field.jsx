import { useId } from 'react';
import { cn } from '@/utils/cn';

/**
 * Label + control + (hint | error) in the one order they should always appear.
 * Wires htmlFor/id/aria-describedby so the error is announced rather than merely
 * shown in red — colour alone is not an error message.
 */
export function Field({ label, hint, error, required, children, className }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="block text-label text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children({ id, invalid: Boolean(error), 'aria-describedby': describedBy || undefined })}

      {error ? (
        <p id={errorId} role="alert" className="text-caption text-destructive-strong">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
