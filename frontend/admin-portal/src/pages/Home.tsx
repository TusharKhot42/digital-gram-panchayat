import { useTranslation } from 'react-i18next';
import { Users, ClipboardList, FileText, Megaphone } from 'lucide-react';

const metrics = [
  { key: 'citizens', icon: Users },
  { key: 'pendingComplaints', icon: ClipboardList },
  { key: 'pendingDakhala', icon: FileText },
  { key: 'activeNotices', icon: Megaphone },
] as const;

export function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">—</p>
              <p className="text-sm text-muted-foreground">{t(`dashboard.${key}`)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{t('dashboard.comingSoon')}</p>
    </div>
  );
}
