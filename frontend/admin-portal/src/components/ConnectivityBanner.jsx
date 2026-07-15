import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnline } from '@/hooks/useOnline';

const RECONNECT_VISIBLE_MS = 4000;

/**
 * Connectivity banner for the officer portal. Shows a persistent warning while offline and
 * a brief confirmation when the connection is restored. The admin portal is intentionally
 * NOT a PWA — this is detection + messaging only, no caching or offline data.
 */
export function ConnectivityBanner() {
  const isOnline = useOnline();
  const { t } = useTranslation();
  const [reconnected, setReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      return undefined;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setReconnected(true);
      const timer = setTimeout(() => setReconnected(false), RECONNECT_VISIBLE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-destructive px-4 py-1.5 text-center text-caption font-medium text-destructive-foreground">
        <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{t('conn.offline')}</span>
      </div>
    );
  }

  if (reconnected) {
    return (
      <div className="flex items-center justify-center gap-2 bg-success px-4 py-1.5 text-center text-caption font-medium text-success-foreground">
        <Wifi className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{t('conn.reconnected')}</span>
      </div>
    );
  }

  return null;
}
