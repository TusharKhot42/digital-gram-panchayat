import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold text-foreground">{t('home.welcome')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('home.comingSoon')}</p>
    </div>
  );
}
