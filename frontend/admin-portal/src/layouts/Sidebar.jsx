import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/utils/cn';

const items = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
  { to: '/notices', label: 'nav.notices', icon: Megaphone },
  { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
  { to: '/tax', label: 'nav.tax', icon: Landmark },
  { to: '/schemes', label: 'nav.schemes', icon: BookOpen },
  { to: '/users', label: 'nav.users', icon: Users },
  { to: '/reports', label: 'nav.reports', icon: BarChart3 },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center px-6 text-lg font-semibold text-foreground">
        {t('appName')}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(label)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
