import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectivityBanner } from '@/components/ConnectivityBanner';

export function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Navigating from the drawer should close it, otherwise it covers the page it just opened.
  useEffect(() => setNavOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <MobileSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/*
       * `min-w-0` is load-bearing. This column is a flex item, and a flex item's default
       * `min-width: auto` refuses to shrink below its content's intrinsic width — so the wide
       * tables on the list screens pushed the whole document sideways (up to 546 px of overflow
       * at 375 px) and the `overflow-x-auto` on TableShell could never engage. With min-width
       * pinned to 0 the column tracks the viewport and each table scrolls inside its own shell.
       */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenNav={() => setNavOpen(true)} />
        <ConnectivityBanner />
        {/* Content is capped and centred so tables stay readable on ultrawide displays. */}
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="dgp-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
