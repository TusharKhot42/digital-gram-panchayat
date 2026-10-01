import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, FileText, Eye, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime, formatDate, WARD_DETAILS } from '@dgp/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { controlClass } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { Timeline } from '@/components/Timeline';
import { DocModal } from '@/components/DocModal';
import { SafeImage } from '@/components/SafeImage';
import { cn } from '@/utils/cn';
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
  // Officer edits applied just before approval.
  const [edits, setEdits] = useState({});
  const [remarks, setRemarks] = useState('');
  const [approveFile, setApproveFile] = useState(null);
  const [manualFile, setManualFile] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !a)
    return <p className="text-body text-destructive-strong">{t('dakhala.review.notFound')}</p>;

  const pending = a.status === 'Submitted' || a.status === 'UnderReview';
  const certUrl = a.certificateUrl || a.pdfUrl;
  const hasCertificate = Boolean(certUrl);

  const startApprove = () => {
    setEdits({ ...(a.applicationData || {}) });
    setRemarks(a.officerRemarks || '');
    setApproveFile(null);
    setConfirmApprove(true);
  };

  const doApprove = async () => {
    try {
      await m.approve.mutateAsync({
        applicationData: edits,
        officerRemarks: remarks,
        file: approveFile,
      });
      toast.success(
        approveFile
          ? t('dakhala.review.uploadSuccess', 'Certificate uploaded successfully')
          : t('dakhala.review.approved'),
      );
      setConfirmApprove(false);
      setApproveFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('dakhala.review.actionFailed'));
    }
  };

  const doManualUpload = async () => {
    if (!manualFile) return;
    try {
      await m.uploadCertificate.mutateAsync({ file: manualFile });
      toast.success(t('dakhala.review.uploadSuccess', 'Certificate uploaded successfully'));
      setManualFile(null);
      setIsReplacing(false);
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
        subtitle={
          <span className="flex items-center gap-2">
            <span>{a.applicationId}</span>
            {a.ward && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {locale === 'mr' && WARD_DETAILS[a.ward]?.name_mr
                  ? WARD_DETAILS[a.ward].name_mr
                  : a.ward}
              </span>
            )}
          </span>
        }
        action={<DakhalaStatusBadge status={a.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title={t('dakhala.review.details')}>
            <dl className="divide-y divide-border">
              {a.ward && (
                <div className="flex justify-between gap-3 px-5 py-2.5 bg-primary/5">
                  <dt className="text-body font-medium text-primary">
                    {t('dakhala.dash.ward', 'Ward')}
                  </dt>
                  <dd className="text-right text-body font-semibold text-primary">
                    {locale === 'mr' && WARD_DETAILS[a.ward]?.name_mr
                      ? WARD_DETAILS[a.ward].name_mr
                      : a.ward}
                  </dd>
                </div>
              )}
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
                      <button
                        type="button"
                        onClick={() => setPreview(d)}
                        title={t('doc.view')}
                        className="block w-full transition-opacity duration-150 hover:opacity-90"
                      >
                        {d.type === 'image' ? (
                          <SafeImage
                            src={d.url}
                            alt={d.name || ''}
                            className="h-24 w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-24 w-full items-center justify-center bg-primary-subtle">
                            <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                      <div className="border-t border-border p-2">
                        <p className="truncate text-caption font-medium text-foreground">
                          {d.docType ? t(`dakhala.doc.${d.docType}`, d.docType) : d.name || '—'}
                        </p>
                        {d.group ? (
                          <p className="truncate text-caption text-muted-foreground">
                            {t(`dakhala.docGroup.${d.group}`, d.group)}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setPreview(d)}
                          className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
                        >
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          {t('doc.view')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body text-muted-foreground">{t('dakhala.review.noDocuments')}</p>
              )}
            </CardContent>
          </Panel>

          {a.status === 'Approved' ? (
            <Panel title={t('dakhala.review.certificateTitle', 'Original Certificate')}>
              <CardContent className="space-y-4 p-5">
                {hasCertificate ? (
                  <div className="space-y-3">
                    <dl className="space-y-1.5">
                      {a.certificateNumber ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-caption text-muted-foreground">
                            {t('dakhala.review.certNumber')}
                          </dt>
                          <dd className="text-caption font-medium tabular-nums text-foreground">
                            {a.certificateNumber}
                          </dd>
                        </div>
                      ) : null}
                      {a.issuedAt ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-caption text-muted-foreground">
                            {t('dakhala.review.issuedOn')}
                          </dt>
                          <dd className="text-caption font-medium text-foreground">
                            {formatDate(a.issuedAt, locale)}
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-3">
                        <dt className="text-caption text-muted-foreground">
                          {t('dakhala.review.format', 'File format')}
                        </dt>
                        <dd className="text-caption font-medium uppercase text-foreground">
                          {a.certificateFileType ||
                            (certUrl?.match(/\.(png|jpe?g|webp)/i) ? 'Image' : 'PDF')}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPreview({
                            url: certUrl,
                            type:
                              a.certificateFileType ||
                              (certUrl?.match(/\.(png|jpe?g|webp)/i) ? 'image' : 'pdf'),
                            name:
                              a.certificateFileName ||
                              `${a.certificateNumber || a.applicationId}.${
                                a.certificateFileType === 'image' ? 'jpg' : 'pdf'
                              }`,
                          })
                        }
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        {t('dakhala.review.viewCertificate', 'View Certificate')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsReplacing((p) => !p)}
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        {isReplacing
                          ? t('common.cancel', 'Cancel')
                          : t('dakhala.review.replaceCertificate', 'Replace Certificate')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <p className="text-body font-medium">
                        {t('dakhala.review.certPendingTitle', 'Certificate Pending Upload')}
                      </p>
                    </div>
                    <p className="mt-1 text-caption text-amber-800 dark:text-amber-300">
                      {t(
                        'dakhala.review.certPendingDesc',
                        'Application and documents are approved. Please upload the original signed/stamped certificate so the citizen can view and download it.',
                      )}
                    </p>
                  </div>
                )}

                {(!hasCertificate || isReplacing) && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <h3 className="text-body font-medium text-foreground">
                      {hasCertificate
                        ? t('dakhala.review.replaceCertHeading', 'Upload New Certificate')
                        : t('dakhala.review.uploadCertHeading', 'Upload Original Certificate')}
                    </h3>
                    <p className="text-caption text-muted-foreground">
                      {t(
                        'dakhala.review.uploadCertHint',
                        'Select the original certificate file (PDF, JPG, PNG, WEBP, max 5MB).',
                      )}
                    </p>
                    <input
                      type="file"
                      id="manual-cert-upload"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                      className="block w-full text-caption file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-caption file:font-medium file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                    />
                    {manualFile ? (
                      <div className="flex items-center justify-between text-caption text-muted-foreground">
                        <span className="truncate">
                          {manualFile.name} ({(manualFile.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setManualFile(null);
                            const el = document.getElementById('manual-cert-upload');
                            if (el) el.value = '';
                          }}
                          className="text-destructive hover:underline ml-2"
                        >
                          {t('common.clear', 'Clear')}
                        </button>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      disabled={!manualFile}
                      loading={m.uploadCertificate.isPending}
                      onClick={doManualUpload}
                    >
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      {t('dakhala.review.uploadButton', 'Upload Certificate')}
                    </Button>
                  </div>
                )}
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
                  <div className="space-y-3">
                    <p className="text-caption text-muted-foreground">
                      {t('dakhala.review.reviewBeforeIssue')}
                    </p>
                    <div className="space-y-2.5">
                      {Object.keys(edits).length === 0 ? (
                        <p className="text-caption text-muted-foreground">
                          {t('dakhala.review.noFields')}
                        </p>
                      ) : (
                        Object.entries(edits).map(([key, value]) => (
                          <label key={key} className="block space-y-1">
                            <span className="block text-label text-foreground">
                              {t(`dakhala.field.${key}`, key)}
                            </span>
                            <input
                              className={controlClass}
                              value={value ?? ''}
                              onChange={(e) => setEdits((p) => ({ ...p, [key]: e.target.value }))}
                            />
                          </label>
                        ))
                      )}
                      <label className="block space-y-1">
                        <span className="block text-label text-foreground">
                          {t('dakhala.review.remarks')}
                        </span>
                        <textarea
                          rows={2}
                          className={cn(controlClass, 'h-auto min-h-16 py-2.5')}
                          placeholder={t('dakhala.review.remarksHint')}
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                      </label>

                      {/* Optional Original Certificate File Upload during Approval */}
                      <div className="space-y-1 pt-1">
                        <span className="block text-label font-medium text-foreground">
                          {t('dakhala.review.uploadOriginalCert')}
                        </span>
                        <p className="text-caption text-muted-foreground">
                          {t('dakhala.review.uploadOriginalCertHint')}
                        </p>
                        <input
                          type="file"
                          id="approve-cert-file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={(e) => setApproveFile(e.target.files?.[0] || null)}
                          className="block w-full text-caption file:mr-3 file:rounded-md file:border-0 file:bg-primary-subtle file:px-3 file:py-1.5 file:text-caption file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        {approveFile ? (
                          <div className="flex items-center justify-between text-caption text-muted-foreground">
                            <span className="truncate">
                              {approveFile.name} ({(approveFile.size / 1024).toFixed(0)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setApproveFile(null);
                                const el = document.getElementById('approve-cert-file');
                                if (el) el.value = '';
                              }}
                              className="text-destructive hover:underline ml-2"
                            >
                              {t('common.clear', 'Clear')}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={doApprove} loading={m.approve.isPending}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {approveFile
                          ? t('dakhala.review.approveAndUpload')
                          : t('dakhala.review.approveOnly')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmApprove(false)}>
                        {t('dakhala.review.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button onClick={startApprove}>
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
              <CardContent className="space-y-2 p-5">
                <p className="text-body font-medium text-foreground">
                  {a.status === 'Approved'
                    ? t('dakhala.review.approvedTitle', 'Application Approved')
                    : t('dakhala.review.decided')}
                </p>
                <p className="text-caption text-muted-foreground">
                  {a.status === 'Approved'
                    ? hasCertificate
                      ? t('dakhala.review.approvedWithCert')
                      : t('dakhala.review.approvedNoCert')
                    : null}
                </p>
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

      <DocModal doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
