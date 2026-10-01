import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Megaphone, FileText, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

const items = [
  { to: '/', label: 'nav.home', icon: Home, end: true },
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
  { to: '/notices', label: 'nav.notices', icon: Megaphone },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
  { to: '/profile', label: 'nav.profile', icon: User },
];

export function BottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t('nav.home')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#6495ED]/40 bg-[#1E3A8A] text-white pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              replace={pathname !== '/' && to !== '/'}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-[58px] flex-col items-center justify-center gap-1 py-1.5',
                  'text-[0.75rem] font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-all duration-150',
                      isActive
                        ? 'bg-[#4169E1] text-white shadow-xs scale-105'
                        : 'group-hover:bg-white/10 text-slate-300 group-hover:text-white',
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="max-w-full truncate px-0.5 tracking-tight">{t(label)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
