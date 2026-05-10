import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { AuthState, LoginCredentials } from '@/types/auth';

import { login, logout, register, verifyAuthentication } from '@/server/auth';

import { AuthContext, type AuthContextType } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const checkAuthentication = useCallback(async () => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: true
    }));

    try {
      const isAuthenticated = await verifyAuthentication();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated,
        error: null
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred when trying to verify authentication';

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        error: errorMessage
      }));
    } finally {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const isAuthenticated = await login(credentials);

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated
      }));

      return isAuthenticated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred when trying to login';

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        error: errorMessage
      }));

      return false;
    } finally {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const handleRegister = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const isAuthenticated = await register(credentials);

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated
      }));

      return isAuthenticated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred when trying to register';

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        error: errorMessage
      }));

      return false;
    } finally {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const handleLogout = async () => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: true
    }));

    try {
      const isLogoutSuccessful = await logout();

      if (isLogoutSuccessful) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false
        }));
      }

      return isLogoutSuccessful;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred when trying to logout';

      setAuthState((prev) => ({
        ...prev,
        error: errorMessage
      }));

      return false;
    } finally {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const value: AuthContextType = {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
