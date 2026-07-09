import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">{t('notFound.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('notFound.subtitle')}</p>
      <Button asChild className="mt-2">
        <Link to="/">{t('notFound.backHome')}</Link>
      </Button>
    </div>
  );
}
