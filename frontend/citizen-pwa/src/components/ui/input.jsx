import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Shared control styling. Height 44px on the citizen PWA so every input clears the
 * minimum touch target; the same string was previously re-typed in every form, which
 * is how the h-10/h-11 drift started.
 */
export const controlClass =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-body text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] duration-150 ' +
  'hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring ' +
  'focus-visible:ring-offset-1 focus-visible:ring-offset-background ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlClass,
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, invalid, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlClass,
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlClass,
        'h-auto min-h-24 py-2.5',
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  );
});
