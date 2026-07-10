import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { NotificationPrefs } from '@/features/settings/NotificationPrefs';

/** Standalone notification preferences page (reached from the notification centre). */
export function NotificationSettings() {
  const { t } = useTranslation();

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
      <NotificationPrefs />
    </div>
  );
}
