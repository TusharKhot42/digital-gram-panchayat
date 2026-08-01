import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, FileText } from 'lucide-react';
import { DOWNLOAD_CATEGORIES, formatDate } from '@dgp/shared';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { NoCertificatesArt } from '@/components/Illustration';
import { SkeletonList } from '@/components/Skeleton';
import { QueryError } from '@/components/QueryError';
import { cn } from '@/utils/cn';
import { governanceService } from '../governanceService';
import { useDownloads } from '../hooks';

/** Bytes as something a person reads, or nothing when the size was never recorded. */
function humanSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

export function Downloads() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const [category, setCategory] = useState('');
  const { data, isLoading, isError, refetch } = useDownloads(category ? { category } : undefined);
  const rows = data?.data ?? [];

  /**
   * Register the download, then open the file. The count is what tells an officer which forms
   * villagers actually need; opening the URL directly would never record it.
   */
  const open = async (doc) => {
    try {
      const result = await governanceService.openDownload(doc.id);
      window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error(t('download.failed'));
    }
  };

  const chip = (active) =>
    cn(
      'inline-flex min-h-9 items-center rounded-full border px-3.5 text-caption font-medium transition-colors duration-150',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-card text-muted-foreground hover:bg-accent',
    );

  return (
    <div className="dgp-page">
      <PageHeader title={t('download.title')} subtitle={t('download.intro')} />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('')}
          aria-pressed={category === ''}
          className={chip(category === '')}
        >
          {t('download.allCategories')}
        </button>
        {DOWNLOAD_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={chip(category === c)}
          >
            {t(`download.category.${c}`, c)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError ? (
        <QueryError message={t('download.loadError')} onRetry={refetch} />
      ) : rows.length ? (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {rows.map((doc) => (
            <li key={doc.id} className="min-w-0">
              <div className="flex h-full min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-foreground">{doc.title}</p>
                  {doc.description ? (
                    <p className="mt-0.5 line-clamp-2 text-caption text-muted-foreground">
                      {doc.description}
                    </p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap gap-x-3 text-caption text-muted-foreground">
                    <span>{t(`download.category.${doc.category}`, doc.category)}</span>
                    {doc.year ? <span>{doc.year}</span> : null}
                    {doc.fileSize ? <span>{humanSize(doc.fileSize)}</span> : null}
                    <span>{formatDate(doc.createdAt, locale)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => open(doc)}
                    className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3 text-caption font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('download.get')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          art={NoCertificatesArt}
          title={category ? t('download.emptyFiltered') : t('download.empty')}
        />
      )}
    </div>
  );
}
