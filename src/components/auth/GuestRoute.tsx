import type { ReactNode } from 'react';

import { Navigate } from 'react-router';

import { useAuth } from '@/hooks/useAuth';

import LoadingScreen from '../ui/LoadingScreen';

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
