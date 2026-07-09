import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { formatDateTime } from '@dgp/shared';
import { StatusBadge } from '@/components/StatusBadge';
import { MapView } from '@/components/MapView';
import { StatusTimeline } from '../components/StatusTimeline';
import { useComplaint } from '../hooks';

export function ComplaintDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'mr' ? 'mr' : 'en';
  const { data: c, isLoading, isError } = useComplaint(id);

  if (isLoading)
    return <p className="px-4 py-6 text-sm text-muted-foreground">{t('common.loading')}</p>;
  if (isError || !c)
    return <p className="px-4 py-6 text-sm text-destructive">{t('complaint.detail.notFound')}</p>;

  const [lng, lat] = c.location?.coordinates ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/complaints"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('complaint.detail.back')}
      </Link>

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{c.title}</h1>
          <p className="text-xs text-muted-foreground">{c.complaintId}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <p className="mb-1 text-xs text-muted-foreground">
        {t(`complaint.category.${c.category}`, c.category)} · {formatDateTime(c.createdAt, locale)}
      </p>
      <p className="mb-4 whitespace-pre-wrap text-sm text-foreground">{c.description}</p>

      {c.images?.length ? (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {c.images.map((src) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer">
              <img
                src={src}
                alt=""
                className="h-24 w-full rounded-md border border-border object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}

      {lat != null && lng != null ? (
        <div className="mb-4">
          <MapView latitude={lat} longitude={lng} />
        </div>
      ) : null}

      {c.remarks?.length ? (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {t('complaint.detail.remarks')}
          </h2>
          <ul className="space-y-2">
            {c.remarks.map((r, i) => (
              <li key={`${r.at}-${i}`} className="rounded-md bg-muted p-2 text-sm text-foreground">
                {r.note}
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDateTime(r.at, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {t('complaint.detail.timeline')}
      </h2>
      <StatusTimeline history={c.statusHistory} />
    </div>
  );
}
