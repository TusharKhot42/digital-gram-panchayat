import { useTranslation } from 'react-i18next';
import { Moon, Sun, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, useLanguage } from '@/store';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6">
      <h1 className="text-section text-foreground">{t('dashboard.title')}</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          aria-label="Toggle language"
        >
          {language === 'en' ? 'मर' : 'EN'}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Officer profile">
          <UserCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
