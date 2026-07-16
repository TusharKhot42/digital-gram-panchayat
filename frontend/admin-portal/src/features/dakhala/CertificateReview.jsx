import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { Timeline } from '@/components/Timeline';
import { Lightbox } from '@/components/Lightbox';
import { DakhalaStatusBadge } from './DakhalaStatusBadge';
import { useApplication, useReviewMutations } from './hooks';
import { RejectDialog } from './RejectDialog';

function Panel({ title, children }) {
  return (
    <Card>
      <h2 className="border-b border-border px-5 py-3 text-section text-foreground">{title}</h2>
      {children}
    </Card>
  );
}

export function CertificateReview() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: a, isLoading, isError } = useApplication(id);
  const m = useReviewMutations(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [preview, setPreview] = useState(null);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !a)
    return <p className="text-body text-destructive-strong">{t('dakhala.review.notFound')}</p>;

  const pending = a.status === 'Submitted' || a.status === 'UnderReview';

  const doApprove = async () => {
    try {
      await m.approve.mutateAsync();
      toast.success(t('dakhala.review.approved'));
      setConfirmApprove(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.review.actionFailed'));
    }
  };

  const doReject = async (reason) => {
    try {
      await m.reject.mutateAsync(reason);
      toast.success(t('dakhala.review.rejected'));
      setRejectOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.review.actionFailed'));
    }
  };

  return (
    <div>
      <PageHeader
        backTo="/dakhala"
        backLabel={t('dakhala.review.back')}
        title={t(`dakhala.type.${a.certificateType}`, a.certificateType)}
        subtitle={a.applicationId}
        action={<DakhalaStatusBadge status={a.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title={t('dakhala.review.details')}>
            <dl className="divide-y divide-border">
              {Object.entries(a.applicationData || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3 px-5 py-2.5">
                  <dt className="text-body text-muted-foreground">
                    {t(`dakhala.field.${key}`, key)}
                  </dt>
                  <dd className="text-right text-body font-medium text-foreground">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title={t('dakhala.review.documents')}>
            <CardContent className="p-5">
              {a.uploadedDocuments?.length ? (
                <div className="flex flex-wrap gap-3">
                  {a.uploadedDocuments.map((d, i) => (
                    <div
                      key={`${d.url}-${i}`}
                      className="w-40 overflow-hidden rounded-md border border-border"
                    >
                      {d.type === 'image' ? (
                        <button
                          type="button"
                          onClick={() => setPreview(d.url)}
                          title={t('dakhala.review.zoom')}
                          className="block w-full transition-opacity duration-150 hover:opacity-90"
                        >
                          <img
                            src={d.url}
                            alt={d.name || ''}
                            className="h-24 w-full object-cover"
                          />
                        </button>
                      ) : (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-24 w-full items-center justify-center bg-primary-subtle transition-opacity duration-150 hover:opacity-90"
                        >
                          <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                        </a>
                      )}
                      <div className="border-t border-border p-2">
                        <p className="truncate text-caption font-medium text-foreground">
                          {d.docType ? t(`dakhala.doc.${d.docType}`, d.docType) : d.name || '—'}
                        </p>
                        {d.group ? (
                          <p className="truncate text-caption text-muted-foreground">
                            {t(`dakhala.docGroup.${d.group}`, d.group)}
                          </p>
                        ) : null}
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          {t('dakhala.review.open')}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body text-muted-foreground">{t('dakhala.review.noDocuments')}</p>
              )}
            </CardContent>
          </Panel>

          {a.status === 'Approved' && a.pdfUrl ? (
            <Panel title={t('dakhala.review.pdf')}>
              <CardContent className="p-5">
                <a
                  href={a.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-body font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {t('dakhala.review.openPdf')}
                </a>
              </CardContent>
            </Panel>
          ) : null}

          {a.status === 'Rejected' && a.rejectionReason ? (
            <div
              role="alert"
              className="rounded-lg bg-destructive-subtle p-4 text-body text-destructive-strong ring-1 ring-inset ring-destructive/20"
            >
              <span className="font-medium">{t('dakhala.review.rejectionReason')}: </span>
              {a.rejectionReason}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {pending ? (
            <Panel title={t('dakhala.review.decision')}>
              <CardContent className="p-5">
                {confirmApprove ? (
                  <div className="space-y-2.5">
                    <p className="text-body text-muted-foreground">
                      {t('dakhala.review.approveConfirm', {
                        type: t(`dakhala.type.${a.certificateType}`, a.certificateType),
                      })}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={doApprove} loading={m.approve.isPending}>
                        {t('dakhala.review.confirmApprove')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmApprove(false)}>
                        {t('dakhala.review.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => setConfirmApprove(true)}>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {t('dakhala.review.approve')}
                    </Button>
                    <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                      <X className="h-4 w-4" aria-hidden="true" />
                      {t('dakhala.review.reject')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Panel>
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="text-body text-muted-foreground">{t('dakhala.review.decided')}</p>
              </CardContent>
            </Card>
          )}

          <Panel title={t('dakhala.review.timeline')}>
            <CardContent className="p-5">
              <Timeline
                items={[...a.history].reverse().map((h, i) => ({
                  key: `${h.status}-${h.at}-${i}`,
                  title: t(`dakhala.status.${h.status}`, h.status),
                  meta: formatDateTime(h.at, locale),
                  note: h.note,
                }))}
              />
            </CardContent>
          </Panel>
        </div>
      </div>

      <RejectDialog
        open={rejectOpen}
        application={a}
        isPending={m.reject.isPending}
        onReject={doReject}
        onClose={() => setRejectOpen(false)}
      />

      <Lightbox src={preview} label={t('dakhala.review.zoom')} onClose={() => setPreview(null)} />
    </div>
  );
}
