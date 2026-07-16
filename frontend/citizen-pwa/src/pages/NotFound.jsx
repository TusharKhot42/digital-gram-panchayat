import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CenteredPanel, StatusPanel } from '@/components/CenteredPanel';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <CenteredPanel>
      <StatusPanel
        icon={Compass}
        title={t('notFound.title')}
        description={t('notFound.subtitle')}
        action={
          <Button asChild>
            <Link to="/">{t('notFound.backHome')}</Link>
          </Button>
        }
      />
    </CenteredPanel>
  );
}
