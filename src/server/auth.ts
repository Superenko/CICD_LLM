import type { AuthenticationResponse, LoginCredentials, LogoutResponse } from '@/types/auth';

export const verifyAuthentication = async () => {
  const response = await fetch('/api/auth/verify', {
    method: 'GET',
    credentials: 'include'
  });

  if (response.ok) {
    const data: AuthenticationResponse = await response.json();
    return data.isAuthenticated;
  }

  return false;
};

export const login = async (credentials: LoginCredentials) => {
  const { email, password } = credentials;

  const authHeader = btoa(`${email}:${password}`);

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (response.ok) {
    const data: AuthenticationResponse = await response.json();
    return data.isAuthenticated;
  }

  return false;
};

export const logout = async () => {
  const logoutResponse = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  if (!logoutResponse.ok) {
    return false;
  }

  const logoutData: LogoutResponse = await logoutResponse.json();
  return logoutData.success;
};
