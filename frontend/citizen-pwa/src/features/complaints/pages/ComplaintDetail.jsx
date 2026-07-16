import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { StatusBadge } from '@/components/StatusBadge';
import { MapView } from '@/components/MapView';
import { Lightbox } from '@/components/Lightbox';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, SectionHeader } from '@/components/PageHeader';
import { Stepper } from '@/components/Stepper';
import { StatusTimeline } from '../components/StatusTimeline';
import { useComplaint } from '../hooks';

/** The lifecycle a complaint moves through, in order. */
const STAGES = ['Pending', 'InProgress', 'Resolved'];

export function ComplaintDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: c, isLoading, isError } = useComplaint(id);
  const [preview, setPreview] = useState(null);

  if (isLoading)
    return <p className="dgp-page text-body text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !c)
    return (
      <p className="dgp-page text-body text-destructive-strong">{t('complaint.detail.notFound')}</p>
    );

  const [lng, lat] = c.location?.coordinates ?? [];
  const stage = Math.max(0, STAGES.indexOf(c.status));
  const steps = STAGES.map((key) => ({ key, label: t(`complaint.status.${key}`, key) }));

  return (
    <div className="dgp-page">
      <PageHeader
        backTo="/complaints"
        backLabel={t('complaint.detail.back')}
        title={c.title}
        subtitle={c.complaintId}
        action={<StatusBadge status={c.status} />}
      />

      <Card className="mb-4">
        <CardContent className="px-3 py-5">
          <Stepper steps={steps} current={stage} label={t('complaint.detail.timeline')} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <p className="text-caption text-muted-foreground">
            {t(`complaint.category.${c.category}`, c.category)} ·{' '}
            {formatDateTime(c.createdAt, locale)}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-body text-foreground">{c.description}</p>
        </CardContent>
      </Card>

      {c.images?.length ? (
        <>
          <SectionHeader title={t('complaint.detail.photos')} />
          <div className="mb-6 grid grid-cols-3 gap-2">
            {c.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPreview(src)}
                aria-label={`${t('complaint.detail.photo')} ${i + 1}`}
                className="overflow-hidden rounded-md border border-border transition-opacity duration-150 hover:opacity-90"
              >
                <img src={src} alt="" className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {lat != null && lng != null ? (
        <>
          <SectionHeader title={t('complaint.detail.location')} />
          <Card className="mb-6 overflow-hidden">
            <MapView latitude={lat} longitude={lng} />
            <div className="flex items-center gap-1.5 border-t border-border px-3 py-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <p className="text-caption tabular-nums text-muted-foreground">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </Card>
        </>
      ) : null}

      {c.remarks?.length ? (
        <>
          <SectionHeader title={t('complaint.detail.remarks')} />
          <ul className="mb-6 space-y-2">
            {c.remarks.map((r, i) => (
              <li
                key={`${r.at}-${i}`}
                className="rounded-md bg-secondary p-3 text-body text-foreground"
              >
                {r.i18n?.[locale] || r.note}
                <span className="mt-1 block text-caption text-muted-foreground">
                  {formatDateTime(r.at, locale)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionHeader title={t('complaint.detail.timeline')} />
      <Card>
        <CardContent>
          <StatusTimeline history={c.statusHistory} />
        </CardContent>
      </Card>

      <Lightbox
        src={preview}
        label={t('complaint.detail.photo')}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
