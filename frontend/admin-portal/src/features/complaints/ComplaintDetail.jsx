import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { COMPLAINT_STATUSES, formatDateTime } from '@dgp/shared';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, Textarea } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { MapView } from '@/components/MapView';
import { Lightbox } from '@/components/Lightbox';
import { PageHeader } from '@/components/PageHeader';
import { SafeImage } from '@/components/SafeImage';

import { useComplaint, useUpdateComplaintStatus } from './hooks';

/** Card with a ruled heading — the repeated shape down both columns of this page. */
function Panel({ title, children, as: Tag = 'div', ...props }) {
  return (
    <Card>
      <Tag {...props}>
        <h2 className="border-b border-border px-5 py-3 text-section text-foreground">{title}</h2>
        {children}
      </Tag>
    </Card>
  );
}

export function ComplaintDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: c, isLoading, isError } = useComplaint(id);
  const updateMutation = useUpdateComplaintStatus(id);

  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [preview, setPreview] = useState(null);

  if (isLoading) return <p className="text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !c)
    return <p className="text-body text-destructive-strong">{t('complaint.detail.notFound')}</p>;

  const effectiveStatus = status || c.status;
  const [lng, lat] = c.location?.coordinates ?? [];

  const submit = async (e) => {
    e.preventDefault();
    // Closing a complaint without saying why leaves the citizen with no explanation.
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
      <PageHeader
        backTo="/complaints"
        backLabel={t('complaint.detail.back')}
        title={c.title}
        subtitle={c.complaintId}
        action={<StatusBadge status={c.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-caption text-muted-foreground">
                {t(`complaint.category.${c.category}`, c.category)} ·{' '}
                {formatDateTime(c.createdAt, locale)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-body text-body-foreground">
                {c.description}
              </p>
              {c.address ? (
                <p className="mt-3 flex items-start gap-1.5 text-body text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {c.address}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {c.images?.length ? (
            <Panel title={t('complaint.detail.photos')}>
              <CardContent className="flex flex-wrap gap-2 p-5">
                {c.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPreview(src)}
                    aria-label={`${t('complaint.detail.photos')} ${i + 1}`}
                    className="overflow-hidden rounded-md border border-border transition-opacity duration-150 hover:opacity-90"
                  >
                    <SafeImage src={src} className="h-28 w-28 object-cover" />
                  </button>
                ))}
              </CardContent>
            </Panel>
          ) : null}

          {lat != null && lng != null ? (
            <Panel title={t('complaint.detail.location')}>
              <MapView latitude={lat} longitude={lng} />
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4">
          <Panel as="form" onSubmit={submit} title={t('complaint.detail.updateStatus')}>
            <CardContent className="space-y-2.5 p-5">
              <Select
                value={effectiveStatus}
                onChange={(e) => setStatus(e.target.value)}
                aria-label={t('complaint.detail.updateStatus')}
              >
                {COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`complaint.status.${s}`, s)}
                  </option>
                ))}
              </Select>
              <Textarea
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t('complaint.detail.remarkPlaceholder')}
                aria-label={t('complaint.detail.remarkPlaceholder')}
              />
              <Button type="submit" className="w-full" loading={updateMutation.isPending}>
                {t('complaint.detail.save')}
              </Button>
            </CardContent>
          </Panel>

          <Panel title={t('complaint.detail.timeline')}>
            <CardContent className="p-5">
              <StatusTimeline history={c.statusHistory} />
            </CardContent>
          </Panel>

          {c.remarks?.length ? (
            <Panel title={t('complaint.detail.remarks')}>
              <CardContent className="p-5">
                <ul className="space-y-2">
                  {c.remarks.map((r, i) => (
                    <li
                      key={`${r.at}-${i}`}
                      className="rounded-md bg-secondary p-2.5 text-body text-foreground"
                    >
                      {r.note}
                      <span className="mt-1 block text-caption text-muted-foreground">
                        {formatDateTime(r.at, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Panel>
          ) : null}
        </div>
      </div>

      <Lightbox
        src={preview}
        label={t('complaint.detail.photos')}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
