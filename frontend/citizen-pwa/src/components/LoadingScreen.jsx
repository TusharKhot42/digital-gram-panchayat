import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </div>
  );
}
