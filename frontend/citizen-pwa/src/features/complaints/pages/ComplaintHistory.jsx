import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Inbox } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { useMyComplaints } from '../hooks';

export function ComplaintHistory() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading, isError, refetch, isFetching } = useMyComplaints();

  const complaints = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('complaint.history.title')}</h1>
        <Button asChild size="sm">
          <Link to="/complaints/new">
            <Plus className="h-4 w-4" />
            {t('complaint.history.new')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <QueryError
          message={t('complaint.history.loadError')}
          onRetry={() => refetch()}
          isFetching={isFetching}
        />
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('complaint.history.empty')}</p>
          <Button asChild size="sm">
            <Link to="/complaints/new">{t('complaint.history.new')}</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li key={c.id}>
              <Link
                to={`/complaints/${c.id}`}
                className="block rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.complaintId}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t(`complaint.category.${c.category}`, c.category)} ·{' '}
                  {formatDate(c.createdAt, locale)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
