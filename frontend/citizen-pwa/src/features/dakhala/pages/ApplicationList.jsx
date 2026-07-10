import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText } from 'lucide-react';
import { formatDate } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { DakhalaStatusBadge } from '../components/DakhalaStatusBadge';
import { useMyApplications } from '../hooks';

export function ApplicationList() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data, isLoading, isError } = useMyApplications();
  const apps = data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t('dakhala.list.title')}</h1>
        <Button asChild size="sm">
          <Link to="/dakhala/new">
            <Plus className="h-4 w-4" />
            {t('dakhala.list.apply')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('dakhala.list.loadError')}</p>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('dakhala.list.empty')}</p>
          <Button asChild size="sm">
            <Link to="/dakhala/new">{t('dakhala.list.apply')}</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id}>
              <Link
                to={`/dakhala/${a.id}`}
                className="block rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.applicationId}</p>
                  </div>
                  <DakhalaStatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(a.createdAt, locale)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
