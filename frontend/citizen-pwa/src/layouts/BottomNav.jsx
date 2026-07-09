import { NavLink } from 'react-router-dom';
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 py-1 text-xs font-medium text-muted-foreground transition-colors',
                  isActive && 'text-primary',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{t(label)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
