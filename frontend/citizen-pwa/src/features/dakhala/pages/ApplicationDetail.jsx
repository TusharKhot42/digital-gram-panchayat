import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { DakhalaStatusBadge } from '../components/DakhalaStatusBadge';
import { useApplication } from '../hooks';
import { certificateService } from '../certificateService';

export function ApplicationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: a, isLoading, isError } = useApplication(id);
  const [downloading, setDownloading] = useState(false);

  if (isLoading)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !a)
    return <p className="px-4 py-6 text-sm text-destructive">{t('dakhala.detail.notFound')}</p>;

  const download = async () => {
    setDownloading(true);
    try {
      const { pdfUrl } = await certificateService.getCertificate(a.id);
      window.open(pdfUrl, '_blank', 'noopener');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.detail.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/dakhala"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dakhala.detail.back')}
      </Link>

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
          </h1>
          <p className="text-xs text-muted-foreground">{a.applicationId}</p>
        </div>
        <DakhalaStatusBadge status={a.status} />
      </div>

      {a.status === 'Approved' ? (
        <Button className="mb-4 w-full" onClick={download} disabled={downloading}>
          <Download className="h-4 w-4" />
          {downloading ? t('common.loading') : t('dakhala.detail.download')}
        </Button>
      ) : null}

      {a.status === 'Rejected' && a.rejectionReason ? (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <span className="font-medium">{t('dakhala.detail.rejected')}: </span>
          {a.rejectionReason}
        </div>
      ) : null}

      <h2 className="mb-2 text-sm font-semibold text-foreground">{t('dakhala.detail.details')}</h2>
      <div className="mb-4 space-y-1 rounded-md border border-border bg-card p-3">
        {Object.entries(a.applicationData || {}).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{t(`dakhala.field.${key}`, key)}</span>
            <span className="text-right font-medium text-foreground">{String(value)}</span>
          </div>
        ))}
      </div>

      {a.uploadedDocuments?.length ? (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {t('dakhala.detail.documents')}
          </h2>
          <ul className="space-y-2">
            {a.uploadedDocuments.map((d, i) => (
              <li key={`${d.url}-${i}`}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate">
                    {d.name || `${t('dakhala.detail.document')} ${i + 1}`}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold text-foreground">{t('dakhala.detail.timeline')}</h2>
      <ol className="space-y-4">
        {a.history.map((h, idx) => (
          <li key={`${h.status}-${h.at}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${idx === a.history.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`}
              />
              {idx < a.history.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium text-foreground">
                {t(`dakhala.status.${h.status}`, h.status)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDateTime(h.at, locale)}</p>
              {h.note ? <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
