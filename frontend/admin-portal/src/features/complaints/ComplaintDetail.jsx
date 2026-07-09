import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { COMPLAINT_STATUSES, formatDateTime } from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { MapView } from '@/components/MapView';
import { useComplaint, useUpdateComplaintStatus } from './hooks';

export function ComplaintDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: c, isLoading, isError } = useComplaint(id);
  const updateMutation = useUpdateComplaintStatus(id);

  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [preview, setPreview] = useState(null);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !c)
    return <p className="text-sm text-destructive">{t('complaint.detail.notFound')}</p>;

  const effectiveStatus = status || c.status;
  const [lng, lat] = c.location?.coordinates ?? [];

  const submit = async (e) => {
    e.preventDefault();
    if (effectiveStatus === 'Resolved' && !remark.trim()) {
      toast.error(t('complaint.detail.remarkRequired'));
      return;
    }
    try {
      await updateMutation.mutateAsync({
        status: effectiveStatus,
        remark: remark.trim() || undefined,
      });
      toast.success(t('complaint.detail.updated'));
      setRemark('');
      setStatus('');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || t('complaint.detail.updateFailed'));
    }
  };

  return (
    <div>
      <Link
        to="/complaints"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('complaint.detail.back')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold text-foreground">{c.title}</h1>
                <p className="text-xs text-muted-foreground">{c.complaintId}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <p className="mb-1 text-xs text-muted-foreground">
              {t(`complaint.category.${c.category}`, c.category)} ·{' '}
              {formatDateTime(c.createdAt, locale)}
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{c.description}</p>
            {c.address ? <p className="mt-2 text-sm text-muted-foreground">{c.address}</p> : null}
          </div>

          {c.images?.length ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {t('complaint.detail.photos')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {c.images.map((src) => (
                  <button key={src} type="button" onClick={() => setPreview(src)}>
                    <img
                      src={src}
                      alt=""
                      className="h-28 w-28 rounded-md border border-border object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {lat != null && lng != null ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {t('complaint.detail.location')}
              </h2>
              <MapView latitude={lat} longitude={lng} />
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <form onSubmit={submit} className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('complaint.detail.updateStatus')}
            </h2>
            <select
              value={effectiveStatus}
              onChange={(e) => setStatus(e.target.value)}
              className="mb-3 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`complaint.status.${s}`, s)}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={t('complaint.detail.remarkPlaceholder')}
              className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.loading') : t('complaint.detail.save')}
            </Button>
          </form>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('complaint.detail.timeline')}
            </h2>
            <StatusTimeline history={c.statusHistory} />
          </div>

          {c.remarks?.length ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {t('complaint.detail.remarks')}
              </h2>
              <ul className="space-y-2">
                {c.remarks.map((r, i) => (
                  <li key={`${r.at}-${i}`} className="rounded-md bg-muted p-2 text-sm">
                    {r.note}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatDateTime(r.at, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {preview ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="" className="max-h-full max-w-full rounded-md" />
        </button>
      ) : null}
    </div>
  );
}
