import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';

import { AppsProvider } from './contexts/apps/AppsContext';
import { AuthProvider } from './contexts/auth/AuthContext';
import router from './router';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const jsx = (
  <StrictMode>
    <AuthProvider>
      <AppsProvider>
        <RouterProvider router={router} />
        <ToastContainer position="bottom-center" stacked />
      </AppsProvider>
    </AuthProvider>
  </StrictMode>
);

createRoot(rootElement).render(jsx);
