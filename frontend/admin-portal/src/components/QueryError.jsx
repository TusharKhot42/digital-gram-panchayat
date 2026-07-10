import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/** Inline error state for a failed query with a Retry button wired to the query's refetch. */
export function QueryError({ message, onRetry, isFetching = false }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <AlertTriangle className="h-9 w-9 text-muted-foreground/60" aria-hidden="true" />
      <p className="max-w-sm text-sm text-muted-foreground">{message || t('error.generic')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
          {t('error.retry')}
        </button>
      )}
    </div>
  );
}
