import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/features/auth/Login';
import { ComplaintsList } from '@/features/complaints/ComplaintsList';
import { ComplaintDetail } from '@/features/complaints/ComplaintDetail';
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
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
