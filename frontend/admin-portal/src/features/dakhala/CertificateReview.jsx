import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, X, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { useApplication, useReviewMutations } from './hooks';
import { RejectDialog } from './RejectDialog';

const STATUS_CLASS = {
  Submitted: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  UnderReview: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  Rejected: 'bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
};

export function CertificateReview() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: a, isLoading, isError } = useApplication(id);
  const m = useReviewMutations(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !a)
    return <p className="text-sm text-destructive">{t('dakhala.review.notFound')}</p>;

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
      <Link
        to="/dakhala"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dakhala.review.back')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {t(`dakhala.type.${a.certificateType}`, a.certificateType)}
                </h1>
                <p className="text-xs text-muted-foreground">{a.applicationId}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status]}`}
              >
                {t(`dakhala.status.${a.status}`, a.status)}
              </span>
            </div>

            <h2 className="mb-2 text-sm font-semibold text-foreground">
              {t('dakhala.review.details')}
            </h2>
            <div className="space-y-1">
              {Object.entries(a.applicationData || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{t(`dakhala.field.${key}`, key)}</span>
                  <span className="text-right font-medium text-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('dakhala.review.documents')}
            </h2>
            {a.uploadedDocuments?.length ? (
              <div className="flex flex-wrap gap-2">
                {a.uploadedDocuments.map((d, i) => (
                  <a
                    key={`${d.url}-${i}`}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    {d.name || `${t('dakhala.review.document')} ${i + 1}`}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dakhala.review.noDocuments')}</p>
            )}
          </div>

          {a.status === 'Approved' && a.pdfUrl ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {t('dakhala.review.pdf')}
              </h2>
              <a
                href={a.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                {t('dakhala.review.openPdf')}
              </a>
            </div>
          ) : null}

          {a.status === 'Rejected' && a.rejectionReason ? (
            <div className="rounded-lg border border-border bg-destructive/10 p-4 text-sm text-destructive">
              <span className="font-medium">{t('dakhala.review.rejectionReason')}: </span>
              {a.rejectionReason}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {pending ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {t('dakhala.review.decision')}
              </h2>
              {confirmApprove ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('dakhala.review.approveConfirm', {
                      type: t(`dakhala.type.${a.certificateType}`, a.certificateType),
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={doApprove} disabled={m.approve.isPending}>
                      {m.approve.isPending
                        ? t('common.loading')
                        : t('dakhala.review.confirmApprove')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmApprove(false)}>
                      {t('dakhala.review.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setConfirmApprove(true)}>
                    <Check className="h-4 w-4" />
                    {t('dakhala.review.approve')}
                  </Button>
                  <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                    <X className="h-4 w-4" />
                    {t('dakhala.review.reject')}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
              {t('dakhala.review.decided')}
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('dakhala.review.timeline')}
            </h2>
            <ol className="space-y-3">
              {[...a.history].reverse().map((h, i) => (
                <li key={`${h.status}-${h.at}-${i}`} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-foreground">{t(`dakhala.status.${h.status}`, h.status)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.at, locale)}</p>
                    {h.note ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <RejectDialog
        open={rejectOpen}
        application={a}
        isPending={m.reject.isPending}
        onReject={doReject}
        onClose={() => setRejectOpen(false)}
      />
    </div>
  );
}
