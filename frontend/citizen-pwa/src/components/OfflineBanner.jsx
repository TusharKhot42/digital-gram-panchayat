import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { useOnline } from '@/hooks/useOnline';

/**
 * Thin banner pinned under the header whenever the device loses connectivity. Reassures
 * the citizen that cached data is still readable and that a complaint filed now will be
 * queued and sent on reconnect.
 */
export function OfflineBanner() {
  const isOnline = useOnline();
  const { t } = useTranslation();

  if (isOnline) return null;

  // White on #F59E0B is only ~2.1:1; the warning foreground token is the dark ink that
  // actually reads against amber.
  return (
    <div className="flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-center text-caption font-medium text-warning-foreground">
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t('pwa.offlineBanner')}</span>
    </div>
  );
}
