import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

/** The row of controls above a table. Wraps on narrow screens rather than overflowing. */
export function FilterBar({ children, className }) {
  return <div className={cn('mb-4 flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

/**
 * Search box with a leading icon and a clear affordance that only appears once there's
 * something to clear.
 */
export function SearchInput({ value, onChange, placeholder, className }) {
  const { t } = useTranslation();

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-64 max-w-full pl-9 pr-9"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.clear')}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
