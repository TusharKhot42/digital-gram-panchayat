import { useTranslation } from 'react-i18next';
import { CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Full-screen fallback shown when a page needs the network but no cached copy exists
 * (e.g. a never-visited detail view opened offline). Everything already cached — notices,
 * schemes, tax, profile, complaint history — keeps working without hitting this screen.
 */
export function Offline({ onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <CloudOff className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">{t('pwa.offlineTitle')}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{t('pwa.offlineBody')}</p>
      <Button className="mt-2" onClick={onRetry ?? (() => window.location.reload())}>
        {t('pwa.retry')}
      </Button>
    </div>
  );
}
