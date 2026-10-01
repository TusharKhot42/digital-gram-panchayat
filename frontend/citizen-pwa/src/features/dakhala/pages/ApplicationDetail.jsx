import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/PageHeader';
import { Stepper } from '@/components/Stepper';
import { DocModal } from '@/components/DocModal';
import { DakhalaStatusBadge } from '../components/DakhalaStatusBadge';
import { useApplication } from '../hooks';
import { certificateService } from '../certificateService';

/** The happy path a certificate travels. Rejection is not a stage — it ends the journey. */
const STAGES = ['Submitted', 'UnderReview', 'Approved', 'Download'];

/**
 * Where the application sits on the rail. A rejected application freezes at the stage that
 * rejected it (Under Review) so the rail shows where it stopped rather than a fake position.
 */
function stageIndex(status, hasCert) {
  if (status === 'Approved') return hasCert ? 3 : 2;
  if (status === 'UnderReview' || status === 'Rejected') return 1;
  return 0;
}

export function ApplicationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: a, isLoading, isError } = useApplication(id);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState(null); // doc opened in the in-app viewer

  if (isLoading)
    return <p className="dgp-page text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !a)
    return (
      <p className="dgp-page text-body text-destructive-strong">{t('dakhala.detail.notFound')}</p>
    );

  const hasCertificate = Boolean(a.certificateUrl || a.pdfUrl);

  const viewCertificate = async () => {
    setDownloading(true);
    try {
      const res = await certificateService.getCertificate(a.id);
      const url = res.certificateUrl || res.pdfUrl;
      const type = res.type || (url.match(/\.(png|jpe?g|webp)(\?|$)/i) ? 'image' : 'pdf');
      const ext = type === 'image' ? url.match(/\.(png|jpe?g|webp)(\?|$)/i)?.[1] || 'jpg' : 'pdf';
      const name = res.certificateFileName || `${a.certificateNumber || a.applicationId}.${ext}`;
      // Open the certificate inside the app rather than a new browser tab.
      setPreview({ url, type, name });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.detail.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  const rejected = a.status === 'Rejected';
  const steps = STAGES.map((key) => ({ key, label: t(`dakhala.stage.${key}`) }));

  return (
    <div className="dgp-page">
      <PageHeader
        backTo="/dakhala"
        backLabel={t('dakhala.detail.back')}
        title={t(`dakhala.type.${a.certificateType}`, a.certificateType)}
        subtitle={a.applicationId}
        action={<DakhalaStatusBadge status={a.status} />}
      />

      <Card className="mb-4">
        <CardContent className="px-3 py-5">
          <Stepper
            steps={steps}
            current={stageIndex(a.status, hasCertificate)}
            failed={rejected}
            label={t('dakhala.detail.progress')}
          />
        </CardContent>
      </Card>

      {a.status === 'Approved' ? (
        hasCertificate ? (
          <Button className="mb-4 w-full" onClick={viewCertificate} loading={downloading}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            {t('dakhala.detail.viewCertificate')}
          </Button>
        ) : (
          <div
            role="status"
            className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-body text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200"
          >
            <p className="font-medium">
              {t('dakhala.detail.certPendingTitle', 'Application Approved')}
            </p>
            <p className="mt-0.5 text-caption text-amber-800 dark:text-amber-300">
              {t(
                'dakhala.detail.certificatePending',
                'Your application and documents have been approved. The official certificate will be uploaded by the Gram Panchayat office shortly. Please check back soon.',
              )}
            </p>
          </div>
        )
      ) : null}

      {rejected && a.rejectionReason ? (
        <div
          role="alert"
          className="mb-4 rounded-md bg-destructive-subtle p-3 text-body text-destructive-strong ring-1 ring-inset ring-destructive/20"
        >
          <span className="font-medium">{t('dakhala.detail.rejected')}: </span>
          {a.rejectionReasonI18n?.[locale] || a.rejectionReason}
        </div>
      ) : null}

      <SectionHeader title={t('dakhala.detail.details')} />
      <Card className="mb-6">
        <dl className="divide-y divide-border">
          {Object.entries(a.applicationData || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3 px-3 py-2.5">
              <dt className="text-body text-muted-foreground">{t(`dakhala.field.${key}`, key)}</dt>
              <dd className="text-right text-body font-medium text-foreground">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {a.uploadedDocuments?.length ? (
        <>
          <SectionHeader title={t('dakhala.detail.documents')} />
          <Card className="mb-6">
            <ul className="divide-y divide-border">
              {a.uploadedDocuments.map((d, i) => (
                <li key={`${d.url}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setPreview(d)}
                    className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-muted/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-subtle">
                      <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body text-foreground">
                        {d.docType
                          ? t(`dakhala.doc.${d.docType}`, d.docType)
                          : d.name || `${t('dakhala.detail.document')} ${i + 1}`}
                      </span>
                      {d.group ? (
                        <span className="block truncate text-caption text-muted-foreground">
                          {t(`dakhala.docGroup.${d.group}`, d.group)}
                        </span>
                      ) : null}
                    </span>
                    <Eye className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}

      <SectionHeader title={t('dakhala.detail.timeline')} />
      <Card>
        <CardContent>
          <ol className="space-y-4">
            {a.history.map((h, idx) => {
              const last = idx === a.history.length - 1;
              return (
                <li key={`${h.status}-${h.at}`} className="flex gap-3">
                  <div className="flex flex-col items-center" aria-hidden="true">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        last ? 'bg-primary ring-4 ring-primary-subtle' : 'bg-border'
                      }`}
                    />
                    {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                  </div>
                  <div className="pb-1">
                    <p className="text-body font-medium text-foreground">
                      {t(`dakhala.status.${h.status}`, h.status)}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {formatDateTime(h.at, locale)}
                    </p>
                    {h.note ? (
                      <p className="mt-0.5 text-caption text-muted-foreground">{h.note}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <DocModal doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
