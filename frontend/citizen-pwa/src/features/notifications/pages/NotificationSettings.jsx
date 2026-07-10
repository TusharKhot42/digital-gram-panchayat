import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'dgp_notification_prefs';
const CHANNELS = ['inApp', 'sms', 'voice', 'email'];

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { inApp: true, sms: true, voice: false, email: false };
  } catch {
    return { inApp: true, sms: true, voice: false, email: false };
  }
}

/** Notification preferences — UI only (persisted locally; server-side honouring is future work). */
export function NotificationSettings() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(loadPrefs);

  const toggle = (ch) => setPrefs((p) => ({ ...p, [ch]: !p[ch] }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast.success(t('notif.settings.saved'));
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        to="/notifications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('notif.back')}
      </Link>
      <h1 className="mb-1 text-lg font-semibold text-foreground">{t('notif.settings.title')}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{t('notif.settings.subtitle')}</p>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        {CHANNELS.map((ch) => (
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
