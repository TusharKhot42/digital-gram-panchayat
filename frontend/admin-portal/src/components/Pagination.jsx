import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Table footer: how many records exist, and how to walk them. Every list page had its own
 * copy of this row, half of them with text buttons and half with chevrons — this is the one
 * that ships. `totalLabel` is passed in because each module counts a different noun.
 */
export function Pagination({ page, totalPages, onPage, totalLabel }) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-body text-muted-foreground">
      <span>{totalLabel}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label={t('common.prevPage')}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span className="tabular-nums" aria-live="polite">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label={t('common.nextPage')}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
