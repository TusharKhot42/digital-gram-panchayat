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
