import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectivityBanner } from '@/components/ConnectivityBanner';

export function DashboardLayout() {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <ConnectivityBanner />
        {/* Content is capped and centred so tables stay readable on ultrawide displays. */}
        <main className="flex-1 p-4 md:p-6">
          <div className="dgp-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
