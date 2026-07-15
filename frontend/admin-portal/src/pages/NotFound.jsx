import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-display text-foreground">{t('notFound.title')}</h1>
      <p className="max-w-xs text-body text-muted-foreground">{t('notFound.subtitle')}</p>
      <Button asChild className="mt-2">
        <Link to="/">{t('notFound.backHome')}</Link>
      </Button>
    </div>
  );
}
