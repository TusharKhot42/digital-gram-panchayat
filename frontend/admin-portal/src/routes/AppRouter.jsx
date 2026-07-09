import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/features/auth/Login';
import { ComplaintsList } from '@/features/complaints/ComplaintsList';
import { ComplaintDetail } from '@/features/complaints/ComplaintDetail';
import { NoticesList } from '@/features/notices/NoticesList';
import { NoticeForm } from '@/features/notices/NoticeForm';
import { SchemesList } from '@/features/schemes/SchemesList';
import { SchemeForm } from '@/features/schemes/SchemeForm';
import { TaxList } from '@/features/tax/TaxList';
import { TaxForm } from '@/features/tax/TaxForm';
import { TaxDetail } from '@/features/tax/TaxDetail';
import { ProtectedRoute } from './ProtectedRoute';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'complaints', element: <ComplaintsList /> },
          { path: 'complaints/:id', element: <ComplaintDetail /> },
          { path: 'notices', element: <NoticesList /> },
          { path: 'notices/new', element: <NoticeForm /> },
          { path: 'notices/:id/edit', element: <NoticeForm /> },
          { path: 'schemes', element: <SchemesList /> },
          { path: 'schemes/new', element: <SchemeForm /> },
          { path: 'schemes/:id/edit', element: <SchemeForm /> },
          { path: 'tax', element: <TaxList /> },
          { path: 'tax/new', element: <TaxForm /> },
          { path: 'tax/:id', element: <TaxDetail /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
