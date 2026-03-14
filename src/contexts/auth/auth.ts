import { createContext } from 'react';

import type { AuthState, LoginCredentials } from '@/types/auth';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
