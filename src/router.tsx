import { createBrowserRouter } from 'react-router';

import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { DefaultLayout, GuestLayout } from './layouts';
import { App, Dashboard, Analytics } from './pages';
import { Login } from './pages/auth/login';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <GuestLayout />
      </GuestRoute>
    ),
    children: [
      {
        index: true,
        Component: Login
      }
    ]
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard
      },
      {
        path: '/analytics',
        Component: Analytics
      },
      {
        path: '/:name',
        Component: App
      }
    ]
  }
]);

export default router;
