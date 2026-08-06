import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CenteredPanel, StatusPanel } from '@/components/CenteredPanel';
import { OfflineArt } from '@/components/Illustration';

/**
 * Full-screen fallback shown when a page needs the network but no cached copy exists
 * (e.g. a never-visited detail view opened offline). Everything already cached — notices,
 * schemes, tax, profile, complaint history — keeps working without hitting this screen.
 */
export function Offline({ onRetry }) {
  const { t } = useTranslation();

  return (
    <CenteredPanel>
      <StatusPanel
        art={OfflineArt}
        title={t('pwa.offlineTitle')}
        description={t('pwa.offlineBody')}
        action={
          <Button onClick={onRetry ?? (() => window.location.reload())}>{t('pwa.retry')}</Button>
        }
      />
    </CenteredPanel>
  );
}
