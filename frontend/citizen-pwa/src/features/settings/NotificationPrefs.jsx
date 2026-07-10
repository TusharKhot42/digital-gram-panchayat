import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { NOTIFICATION_CHANNELS } from '@dgp/shared';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'dgp_notification_prefs';
const DEFAULTS = { inApp: true, sms: true, voice: false, email: false };

export function loadNotificationPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/**
 * Notification channel preferences — UI only (persisted locally; server-side honouring is
 * future work). Extracted so both the standalone settings page and the settings hub render
 * the same control.
 */
export function NotificationPrefs() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(loadNotificationPrefs);

  const toggle = (ch) => setPrefs((p) => ({ ...p, [ch]: !p[ch] }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast.success(t('notif.settings.saved'));
  };

  return (
    <div>
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        {NOTIFICATION_CHANNELS.map((ch) => (
          <label key={ch} className="flex items-center justify-between text-sm text-foreground">
            <span>{t(`notif.settings.${ch}`)}</span>
            <input
              type="checkbox"
              checked={Boolean(prefs[ch])}
              onChange={() => toggle(ch)}
              disabled={ch === 'inApp'}
            />
          </label>
        ))}
      </div>
      <Button className="mt-4" onClick={save}>
        {t('notif.settings.save')}
      </Button>
    </div>
  );
}
