import { useTranslation } from 'react-i18next';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * GPS capture control. Optional by design — if denied/unavailable the citizen still
 * submits (blueprint: "Not Available", proceed).
 */
export function GpsCapture({ coords, status, onRequest }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {t('complaint.form.location')}
      </label>

      <Button type="button" variant="outline" onClick={onRequest} disabled={status === 'loading'}>
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        {coords ? t('complaint.form.updateLocation') : t('complaint.form.captureLocation')}
      </Button>

      {coords ? (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ''}
        </p>
      ) : status === 'denied' || status === 'unavailable' ? (
        <p className="text-xs text-muted-foreground">{t('complaint.form.locationUnavailable')}</p>
      ) : null}
    </div>
  );
}
