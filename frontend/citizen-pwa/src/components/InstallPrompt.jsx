import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const DISMISS_KEY = 'dgp_install_dismissed';

/**
 * Floating "Add to Home screen" card. Appears only when the browser has offered an install
 * prompt (Android/Chrome) and the citizen hasn't dismissed it this device. Dismissal is
 * remembered so we don't nag on every launch.
 */
export function InstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  if (!canInstall || dismissed) return null;

  const close = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Download className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{t('pwa.installTitle')}</p>
        <p className="truncate text-xs text-muted-foreground">{t('pwa.installBody')}</p>
      </div>
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        onClick={() => {
          void promptInstall();
        }}
      >
        {t('pwa.install')}
      </button>
      <button type="button" aria-label={t('pwa.dismiss')} className="p-1" onClick={close}>
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
