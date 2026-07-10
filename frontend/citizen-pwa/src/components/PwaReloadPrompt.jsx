import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

/**
 * Bridges the service-worker lifecycle to the UI: a persistent toast with a "Reload"
 * action when a new version is waiting, and a one-off "ready to work offline" toast the
 * first time the app is cached. Renders nothing itself.
 */
export function PwaReloadPrompt() {
  const { t } = useTranslation();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (offlineReady) {
      toast.success(t('pwa.offlineReady'), { id: 'pwa-offline-ready' });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady, t]);

  useEffect(() => {
    if (!needRefresh) return;
    toast(
      (tst) => (
        <div className="flex items-center gap-3">
          <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm">{t('pwa.updateAvailable')}</span>
          <button
            type="button"
            className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
            onClick={() => {
              toast.dismiss(tst.id);
              void updateServiceWorker(true);
            }}
          >
            {t('pwa.reload')}
          </button>
          <button
            type="button"
            className="text-xs text-muted-foreground"
            onClick={() => {
              toast.dismiss(tst.id);
              setNeedRefresh(false);
            }}
          >
            {t('pwa.later')}
          </button>
        </div>
      ),
      { id: 'pwa-update', duration: Infinity },
    );
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t]);

  return null;
}
