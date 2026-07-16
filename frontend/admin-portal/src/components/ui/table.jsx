import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Table shell for the admin portal.
 *
 * Every list screen previously hand-rolled the same `<div class="overflow-x-auto rounded-lg
 * border"><table class="w-full text-sm">` scaffold with its own padding and hover colour.
 * These wrappers fix one set of decisions: the header sticks while the body scrolls, rows
 * highlight on hover, cells share a rhythm, and the horizontal scroll is trapped inside the
 * shell so the page body never scrolls sideways on a narrow screen.
 */
export function TableShell({ className, children, ...props }) {
  return (
    <div
      className={cn('overflow-x-auto rounded-lg border border-border bg-card shadow-xs', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ className, ...props }) {
  return <table className={cn('w-full border-collapse text-body', className)} {...props} />;
}

export function THead({ className, ...props }) {
  return (
    <thead
      className={cn(
        'sticky top-0 z-10 bg-secondary text-left [&_tr]:border-b [&_tr]:border-border',
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TR({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors duration-150 hover:bg-muted/40',
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-label font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }) {
  return <td className={cn('px-4 py-3 align-middle text-foreground', className)} {...props} />;
}

/**
 * Sortable header cell. `state` is 'asc' | 'desc' | false for this column; the arrow is
 * decorative and aria-sort carries the meaning for screen readers.
 */
export function SortableTH({ state = false, onToggle, children, className, ...props }) {
  const Icon = state === 'asc' ? ChevronUp : state === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <TH
      aria-sort={state === 'asc' ? 'ascending' : state === 'desc' ? 'descending' : 'none'}
      className={cn('p-0', className)}
      {...props}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1 px-4 py-2.5 text-left transition-colors duration-150 hover:text-foreground"
      >
        {children}
        <Icon
          className={cn('h-3.5 w-3.5 shrink-0', state ? 'text-foreground' : 'opacity-50')}
          aria-hidden="true"
        />
      </button>
    </TH>
  );
}

/** Full-width message row — loading, error, or empty — spanning every column. */
export function TableMessageRow({ colSpan, children, className }) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-10 text-center', className)}>
        {children}
      </td>
    </tr>
  );
}
