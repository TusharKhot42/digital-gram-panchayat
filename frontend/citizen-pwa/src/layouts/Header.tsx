import { useTranslation } from 'react-i18next';
import { Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, useLanguage } from '@/store';
import { useOnline } from '@/hooks/useOnline';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isOnline = useOnline();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <span className="text-base font-semibold text-foreground">{t('appName')}</span>

      <div className="flex items-center gap-1">
        <span
          className="mr-1 flex items-center gap-1 text-xs text-muted-foreground"
          aria-label={isOnline ? t('common.online') : t('common.offline')}
          title={isOnline ? t('common.online') : t('common.offline')}
        >
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </span>

        <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Toggle language">
          {language === 'mr' ? 'EN' : 'मर'}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
