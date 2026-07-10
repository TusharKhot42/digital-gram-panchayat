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
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
