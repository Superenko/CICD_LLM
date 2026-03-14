export interface AuthenticationResponse {
  isAuthenticated: boolean;
}

export interface LogoutResponse {
  success: boolean;
}

export interface AuthState extends AuthenticationResponse {
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
