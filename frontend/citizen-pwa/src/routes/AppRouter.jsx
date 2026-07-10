import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/features/auth/pages/Login';
import { Register } from '@/features/auth/pages/Register';
import { Profile } from '@/features/auth/pages/Profile';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { ComplaintHistory } from '@/features/complaints/pages/ComplaintHistory';
import { NewComplaint } from '@/features/complaints/pages/NewComplaint';
import { ComplaintDetail } from '@/features/complaints/pages/ComplaintDetail';
import { NoticeList } from '@/features/notices/pages/NoticeList';
import { NoticeDetail } from '@/features/notices/pages/NoticeDetail';
import { SchemeList } from '@/features/schemes/pages/SchemeList';
import { SchemeDetail } from '@/features/schemes/pages/SchemeDetail';
import { TaxSummary } from '@/features/tax/pages/TaxSummary';
import { ApplicationList } from '@/features/dakhala/pages/ApplicationList';
import { ApplyCertificate } from '@/features/dakhala/pages/ApplyCertificate';
import { ApplicationDetail } from '@/features/dakhala/pages/ApplicationDetail';
import { NotificationCenter } from '@/features/notifications/pages/NotificationCenter';
import { NotificationDetail } from '@/features/notifications/pages/NotificationDetail';
import { NotificationSettings } from '@/features/notifications/pages/NotificationSettings';

const router = createBrowserRouter([
  // Public auth screens (no app shell / bottom nav).
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Everything else requires a session.
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'complaints', element: <ComplaintHistory /> },
          { path: 'complaints/new', element: <NewComplaint /> },
          { path: 'complaints/:id', element: <ComplaintDetail /> },
          { path: 'notices', element: <NoticeList /> },
          { path: 'notices/:id', element: <NoticeDetail /> },
          { path: 'schemes', element: <SchemeList /> },
          { path: 'schemes/:id', element: <SchemeDetail /> },
          { path: 'tax', element: <TaxSummary /> },
          { path: 'dakhala', element: <ApplicationList /> },
          { path: 'dakhala/new', element: <ApplyCertificate /> },
          { path: 'dakhala/:id', element: <ApplicationDetail /> },
          { path: 'notifications', element: <NotificationCenter /> },
          { path: 'notifications/:id', element: <NotificationDetail /> },
          { path: 'settings', element: <NotificationSettings /> },
          { path: 'profile', element: <Profile /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
