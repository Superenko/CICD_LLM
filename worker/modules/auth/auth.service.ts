import { Nullable } from '@shared/types';

class AuthService {
  constructor(private readonly env: Env) {}

  public async isAuthenticated(authToken: string): Promise<boolean> {
    const credentials = this.parseCredentialsFromToken(authToken);
    if (!credentials) return false;
    return this.validateCredentials(credentials);
  }

  private parseCredentialsFromToken(
    authToken: string
  ): Nullable<{ email: string; password: string }> {
    if (!authToken) return null;

    const decoded = atob(authToken);
    const [email, password] = decoded.split(':');

    return { email, password };
  }

  private async validateCredentials(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    const validEmail = await this.env.ASH_LIST_TASKS_EMAIL.get();
    const validPassword = await this.env.ASH_LIST_TASKS_PASSWORD.get();

    return credentials.email === validEmail && credentials.password === validPassword;
  }
}

export default AuthService;
