import { Nullable } from '@shared/types';
import { sign, verify } from 'hono/jwt';

class AuthService {
  constructor(private readonly env: Env) {}

  public async validateCredentialsFromBasicAuth(basicAuth: string): Promise<boolean> {
    const credentials = this.parseCredentialsFromBasicAuth(basicAuth);
    if (!credentials) return false;
    return this.validateCredentials(credentials);
  }

  public async generateJWT(): Promise<string> {
    const secret = await this.getJwtSecret();
    const payload = {
      // Token valid for 7 days
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      role: 'admin'
    };
    return await sign(payload, secret, 'HS256');
  }

  public async verifyJWT(token: string): Promise<boolean> {
    try {
      const secret = await this.getJwtSecret();
      await verify(token, secret, 'HS256');
      return true;
    } catch (e) {
      return false;
    }
  }

  private async getJwtSecret(): Promise<string> {
    // Fallback to email if JWT_SECRET is not set (for backwards compatibility during migration)
    const fallbackSecret = await this.env.ASH_LIST_TASKS_EMAIL.get();
    return this.env.JWT_SECRET || fallbackSecret || 'default-secret';
  }

  private parseCredentialsFromBasicAuth(
    basicAuth: string
  ): Nullable<{ email: string; password: string }> {
    if (!basicAuth) return null;

    try {
      const decoded = atob(basicAuth);
      const [email, password] = decoded.split(':');
      return { email, password };
    } catch {
      return null;
    }
  }

  public async register(basicAuth: string): Promise<{ success: boolean; error?: string }> {
    const credentials = this.parseCredentialsFromBasicAuth(basicAuth);
    if (!credentials) return { success: false, error: 'Invalid credentials format' };

    try {
      const { email, password } = credentials;

      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
      }
      if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return { success: false, error: 'Password must contain at least one letter and one number' };
      }

      // Check if email already exists
      const existingUser = await this.env.ASH_LIST_TASKS_DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first();

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Generate salt and hash password
      const salt = crypto.randomUUID();
      const passwordHash = await this.hashPassword(password, salt);

      await this.env.ASH_LIST_TASKS_DB.prepare(
        'INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)'
      ).bind(email, passwordHash, salt).run();

      return { success: true };
    } catch (e) {
      console.error('Registration error:', e);
      return { success: false, error: 'Internal server error during registration' };
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async validateCredentials(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    // 1. Check superadmin from environment variables
    const validEmail = await this.env.ASH_LIST_TASKS_EMAIL.get();
    const validPassword = await this.env.ASH_LIST_TASKS_PASSWORD.get();

    if (credentials.email === validEmail && credentials.password === validPassword) {
      return true;
    }

    // 2. Check users from the database
    try {
      const user = await this.env.ASH_LIST_TASKS_DB.prepare(
        'SELECT password_hash, salt FROM users WHERE email = ?'
      ).bind(credentials.email).first<{ password_hash: string; salt: string }>();

      if (!user) return false;

      const hashAttempt = await this.hashPassword(credentials.password, user.salt);
      return hashAttempt === user.password_hash;
    } catch (e) {
      console.error('Validation error:', e);
      return false;
    }
  }
}

export default AuthService;
