import { cn } from '@/utils/cn';

/** Labeled input with inline error, wired for React Hook Form's register(). */
export function FormField({ label, error, register, type = 'text', className, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        className={cn(
          'h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
          error && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        {...register}
        {...props}
      />
      {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  );
}
