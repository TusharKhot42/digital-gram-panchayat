import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Settings,
  HelpCircle,
  Landmark,
  CalendarClock,
  FileText,
  Menu,
  X,
  Home,
  ClipboardList,
  Megaphone,
  Receipt,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, useLanguage } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { useOnline } from '@/hooks/useOnline';
import { getBackRoute } from '@/utils/navigation';

export function Header() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isOnline = useOnline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/timetable', label: t('nav.timetable'), icon: CalendarClock },
    { to: '/dakhala', label: t('nav.dakhala'), icon: FileText },
  ];

  const fullMobileMenu = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/timetable', label: t('nav.timetable'), icon: CalendarClock },
    { to: '/dakhala', label: t('nav.dakhala'), icon: FileText },
    { to: '/complaints', label: t('nav.complaints'), icon: ClipboardList },
    { to: '/notices', label: t('nav.notices'), icon: Megaphone },
    { to: '/tax', label: t('nav.tax'), icon: Receipt },
  ];

  return (
    <header className="sticky top-0 z-40 relative border-b border-[#6495ED]/40 bg-[#1E3A8A] text-white shadow-md transition-colors duration-150">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          {pathname !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(getBackRoute(pathname))}
              className="h-8 rounded-xl px-2 sm:px-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1 shrink-0 cursor-pointer"
              aria-label={t('common.back', 'Back')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('common.back', 'Back')}</span>
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-xs transition-transform duration-150 group-hover:scale-105">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate text-sm sm:text-base font-bold tracking-tight text-white">
              {t('appName')}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1.5 ml-4"
            aria-label={t('nav.mainNav', 'Main Navigation')}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                replace={pathname !== '/' && to !== '/'}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#4169E1] text-white font-bold shadow-xs'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {user?.ward && (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 text-xs font-semibold hover:bg-amber-400/30 transition-colors"
              title={`${t('auth.ward')}: ${user.ward}`}
            >
              <MapPin className="h-3 w-3 text-amber-300" />
              <span>{user.ward}</span>
            </Link>
          )}

          <span
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
            }`}
            aria-label={isOnline ? t('common.online') : t('common.offline')}
            title={isOnline ? t('common.online') : t('common.offline')}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">
              {isOnline ? t('common.online') : t('common.offline')}
            </span>
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 rounded-xl px-2.5 sm:px-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20"
            aria-label={t('nav.toggleLanguage')}
          >
            {language === 'mr' ? 'English' : 'मराठी'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-white hover:bg-white/15"
            onClick={toggleTheme}
            aria-label={t(theme === 'dark' ? 'nav.themeLight' : 'nav.themeDark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-300" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-100" />
            )}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-white hover:bg-white/15 hidden sm:inline-flex"
            aria-label={t('help.title')}
          >
            <Link to="/help">
              <HelpCircle className="h-4.5 w-4.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-white hover:bg-white/15 hidden sm:inline-flex"
            aria-label={t('settings.title')}
          >
            <Link to="/settings">
              <Settings className="h-4.5 w-4.5" />
            </Link>
          </Button>

          {/* Mobile Hamburger Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-white hover:bg-white/15 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t('nav.toggleMenu', 'Toggle navigation menu')}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu — positioned cleanly below the header */}
      {mobileMenuOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-[#6495ED]/40 bg-[#1E3A8A] p-4 text-white shadow-xl md:hidden animate-in slide-in-from-top duration-150">
          <nav
            className="grid grid-cols-2 gap-2"
            aria-label={t('nav.mobileDrawer', 'Mobile Navigation Drawer')}
          >
            {fullMobileMenu.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                replace={pathname !== '/' && to !== '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl p-3 text-caption font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4169E1] text-white font-bold shadow-xs'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
