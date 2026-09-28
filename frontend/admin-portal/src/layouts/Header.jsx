import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Moon, Sun, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, useLanguage } from '@/store';

/** Prefix match, so /complaints/:id still reads as "Complaints". */
const SECTIONS = [
  ['/complaints', 'nav.complaints'],
  ['/notices', 'nav.notices'],
  ['/dakhala', 'nav.dakhala'],
  ['/tax', 'nav.tax'],
  ['/schemes', 'nav.schemes'],
  ['/users', 'nav.users'],
  ['/notifications', 'nav.notifications'],
  ['/reports', 'nav.reports'],
  ['/audit', 'nav.audit'],
  ['/village', 'nav.village'],
  ['/events', 'nav.events'],
  ['/meetings', 'nav.meetings'],
  ['/projects', 'nav.projects'],
  ['/polls', 'nav.polls'],
  ['/documents', 'nav.documents'],
  ['/feedback', 'nav.feedback'],
  ['/help', 'nav.help'],
];

function sectionKey(pathname) {
  const hit = SECTIONS.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : 'nav.dashboard';
}

export function Header({ onOpenNav }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-[#6495ED]/40 bg-[#1E3A8A] text-white px-4 shadow-md transition-colors duration-150 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-lg text-white hover:bg-white/15"
          onClick={onOpenNav}
          aria-label={t('nav.openMenu')}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {pathname !== '/' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 rounded-xl px-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1 shrink-0"
            aria-label={t('common.back', 'Back')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('common.back', 'Back')}</span>
          </Button>
        )}

        <nav aria-label={t('nav.breadcrumb')} className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-xs text-slate-200">
            <li className="hidden shrink-0 items-center gap-1.5 font-medium sm:flex">
              <ShieldCheck className="h-4 w-4 text-[#93C5FD]" />
              <span className="text-slate-200 font-semibold">{t('nav.portalLabel')}</span>
            </li>
            <li aria-hidden="true" className="hidden shrink-0 sm:block text-slate-400">
              /
            </li>
            <li className="truncate font-bold text-white text-sm bg-[#4169E1] px-3 py-1 rounded-lg shadow-xs">
              {t(sectionKey(pathname))}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          className="h-8 rounded-xl px-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20"
          aria-label={t('nav.toggleLanguage')}
        >
          {language === 'en' ? 'मराठी' : 'English'}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-white hover:bg-white/15"
          onClick={toggleTheme}
          aria-label={t(theme === 'dark' ? 'nav.themeLight' : 'nav.themeDark')}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-300" /> : <Moon className="h-4.5 w-4.5 text-slate-100" />}
        </Button>
      </div>
    </header>
  );
}

