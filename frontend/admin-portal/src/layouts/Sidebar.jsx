import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@dgp/shared/assets/logo.svg';
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
  HelpCircle,
  X,
  Gavel,
  HardHat,
  Vote,
  FolderDown,
  Star,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    title: 'Overview & Services',
    items: [
      { to: '/', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
      { to: '/complaints', label: 'nav.complaints', icon: ClipboardList },
      { to: '/notices', label: 'nav.notices', icon: Megaphone },
      { to: '/dakhala', label: 'nav.dakhala', icon: FileText },
      { to: '/tax', label: 'nav.tax', icon: Landmark },
      { to: '/schemes', label: 'nav.schemes', icon: BookOpen },
    ],
  },
  {
    title: 'Governance & Community',
    items: [
      { to: '/village', label: 'nav.village', icon: Home },
      { to: '/events', label: 'nav.events', icon: CalendarDays },
      { to: '/meetings', label: 'nav.meetings', icon: Gavel },
      { to: '/projects', label: 'nav.projects', icon: HardHat },
      { to: '/polls', label: 'nav.polls', icon: Vote },
      { to: '/documents', label: 'nav.documents', icon: FolderDown },
      { to: '/feedback', label: 'nav.feedback', icon: Star },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/users', label: 'nav.users', icon: Users },
      { to: '/notifications', label: 'nav.notifications', icon: Bell },
      { to: '/reports', label: 'nav.reports', icon: BarChart3 },
      { to: '/audit', label: 'nav.audit', icon: ScrollText },
      { to: '/help', label: 'nav.help', icon: HelpCircle },
    ],
  },
];

/**
 * Brand mark — grounds the portal as an official product, not a generic dashboard.
 */
function Brand() {
  const { t } = useTranslation();
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <img src={logo} alt="" aria-hidden="true" className="h-8 w-8 shrink-0 rounded-lg shadow-xs" />
      <span className="truncate text-base font-extrabold tracking-tight text-[#1E3A8A]">
        {t('appName')}
      </span>
    </span>
  );
}

function NavItems() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="space-y-4">
      {SECTIONS.map((section, idx) => (
        <div key={section.title || idx} className="space-y-1">
          {section.title ? (
            <div className="px-3 pt-2 pb-1 text-[0.6875rem] font-extrabold uppercase tracking-wider text-[#4169E1]">
              {section.title}
            </div>
          ) : null}
          {section.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              replace={pathname !== '/' && to !== '/'}
              className={({ isActive }) =>
                cn(
                  'group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold',
                  'text-slate-600 transition-all duration-150',
                  'hover:bg-[#EBF2FF] hover:text-[#1E3A8A]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  isActive &&
                    'bg-[#4169E1] text-white font-bold shadow-sm shadow-[#4169E1]/30 hover:bg-[#4169E1] hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-y-2 left-0 w-1 rounded-r-full transition-colors duration-150',
                      isActive ? 'bg-amber-400' : 'bg-transparent',
                    )}
                  />
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#1E3A8A]',
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{t(label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Signed-in officer plus the sign-out control, shared by the fixed rail and the drawer. */
function AccountFooter() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="border-t border-[#6495ED]/20 bg-white/70 p-3">
      {user ? (
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-caption font-extrabold text-[#1E3A8A]">
            {user.fullName?.slice(0, 1)?.toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-label font-bold text-slate-900">
              {user.fullName}
            </span>
            <span className="block truncate text-caption text-slate-500">{user.email}</span>
          </span>
        </div>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-slate-700 hover:bg-rose-50 hover:text-rose-600 font-semibold"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        {t('auth.logout')}
      </Button>
    </div>
  );
}

/** Fixed navigation rail. Desktop and large tablets only. */
export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#6495ED]/30 bg-[#F8FAFC] shadow-xs md:flex">
      <div className="flex h-16 items-center border-b border-[#6495ED]/20 px-5 bg-white">
        <Brand />
      </div>

      <nav aria-label={t('nav.primary')} className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <NavItems />
      </nav>

      <AccountFooter />
    </aside>
  );
}

/**
 * Off-canvas navigation for phones and portrait tablets, where the rail is hidden. Without it
 * an officer below 768px could reach a screen and then had no way to leave it — there was no
 * navigation on the page at all.
 */
export function MobileSidebar({ open, onClose }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // aria-modal promises focus stays inside, so Tab has to wrap at both ends.
      if (e.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // Move focus into the drawer so the keyboard and screen reader follow it open.
    panelRef.current?.querySelector('a, button')?.focus();
    // Stop the page behind the overlay from scrolling under the drawer.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.primary')}
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-[#6495ED]/30 bg-[#F8FAFC] shadow-xl"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-[#6495ED]/20 px-4 bg-white">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-700 hover:bg-slate-100"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav aria-label={t('nav.primary')} className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavItems />
        </nav>

        <AccountFooter />
      </div>
    </div>
  );
}
