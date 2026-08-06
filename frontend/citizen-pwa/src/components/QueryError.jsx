import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { OfflineArt, ServerErrorArt } from '@/components/Illustration';

/**
 * Inline error state for a failed query, with a Retry button wired to the query's `refetch`.
 * Detects offline so the message matches the cause. Keeps failures graceful instead of a
 * dead-end error string.
 */
export function QueryError({ message, onRetry, isFetching = false }) {
  const { t } = useTranslation();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      {/*
       * Two drawings, not one icon: "your phone has no signal" and "our server failed" ask
       * different things of the citizen, and the same glyph for both taught them nothing.
       */}
      {offline ? (
        <OfflineArt className="h-20 w-20 text-muted-foreground" />
      ) : (
        <ServerErrorArt className="h-20 w-20 text-muted-foreground" />
      )}
      <p className="max-w-xs text-sm text-muted-foreground">
        {offline ? t('error.offline') : message || t('error.generic')}
      </p>
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
