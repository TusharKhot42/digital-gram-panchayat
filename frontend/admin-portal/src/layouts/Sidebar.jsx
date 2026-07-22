import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ClipboardList,
  Megaphone,
  FileText,
  Landmark,
  BookOpen,
  Users,
  BarChart3,
  Bell,
  ScrollText,
  Home,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const items = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
  { to: '/notices', label: 'nav.notices', icon: Megaphone },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
  { to: '/tax', label: 'nav.tax', icon: Landmark },
  { to: '/schemes', label: 'nav.schemes', icon: BookOpen },
  { to: '/users', label: 'nav.users', icon: Users },
  { to: '/notifications', label: 'nav.notifications', icon: Bell },
  { to: '/reports', label: 'nav.reports', icon: BarChart3 },
  { to: '/audit', label: 'nav.audit', icon: ScrollText },
  { to: '/village', label: 'nav.village', icon: Home },
  { to: '/events', label: 'nav.events', icon: CalendarDays },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      {/* Brand mark — grounds the portal as an official product, not a generic dashboard. */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Landmark className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="truncate text-section text-foreground">{t('appName')}</span>
      </div>

      <nav aria-label={t('nav.dashboard')} className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium',
                'text-muted-foreground transition-colors duration-150',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                isActive && 'bg-primary-subtle text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* 3px rail marks the section — quieter than a full-width fill. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-y-1.5 left-0 w-0.5 rounded-full transition-colors duration-150',
                    isActive ? 'bg-primary' : 'bg-transparent',
                  )}
                />
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{t(label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {user ? (
          <div className="mb-2 flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
              {user.fullName?.slice(0, 1)?.toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-label text-foreground">{user.fullName}</span>
              <span className="block truncate text-caption text-muted-foreground">
                {user.email}
              </span>
            </span>
          </div>
        ) : null}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </Button>
      </div>
    </aside>
  );
}
