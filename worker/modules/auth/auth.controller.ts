import { Nullable } from '@shared/types';
import { deleteCookie, setCookie } from 'hono/cookie';

import { AppContext, AuthContext } from '@/types/context';
import { ErrorStatusCode } from '@/types/misc';
import { handleApiError } from '@/utils/api';
import { AUTH_COOKIE_NAME, WEEK_TIME } from '@/utils/constants';

import AuthService from './auth.service';

export const handleLogin = async (ctx: AppContext) => {
  try {
    const authToken = extractAuthToken(ctx);

    if (!authToken) {
      return ctx.json({ error: 'Unauthorized' }, ErrorStatusCode.UNAUTHORIZED);
    }

    const authService = new AuthService(ctx.env);
    const isAuthenticated = await authService.validateCredentialsFromBasicAuth(authToken);

    if (isAuthenticated) {
      const jwt = await authService.generateJWT();
      setAuthCookie(ctx, jwt);
    } else {
      deleteCookie(ctx, AUTH_COOKIE_NAME);
    }

    return ctx.json({ isAuthenticated });
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during login'), 500);
  }
};

export const handleRegister = async (ctx: AppContext) => {
  try {
    const authToken = extractAuthToken(ctx);

    if (!authToken) {
      return ctx.json({ error: 'Unauthorized' }, ErrorStatusCode.UNAUTHORIZED);
    }

    const authService = new AuthService(ctx.env);
    const result = await authService.register(authToken);

    if (result.success) {
      // Auto-login after successful registration
      const jwt = await authService.generateJWT();
      setAuthCookie(ctx, jwt);
      return ctx.json({ success: true, isAuthenticated: true });
    } else {
      return ctx.json({ error: result.error }, ErrorStatusCode.BAD_REQUEST);
    }
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during registration'), 500);
  }
};

export const handleVerifyAuthentication = async (ctx: AuthContext) => {
  try {
    const authService = new AuthService(ctx.env);
    const isAuthenticated = await authService.verifyJWT(ctx.var.authToken);

    if (isAuthenticated) {
      // Renew cookie expiration
      setAuthCookie(ctx, ctx.var.authToken);
    } else {
      deleteCookie(ctx, AUTH_COOKIE_NAME);
    }

    return ctx.json({ isAuthenticated });
  } catch (error) {
    return ctx.json(
      handleApiError(error, 'An unexpected error occurred when trying to verify authentication'),
      500
    );
  }
};

export const handleLogout = async (ctx: AuthContext) => {
  try {
    deleteCookie(ctx, AUTH_COOKIE_NAME);
    return ctx.json({ success: true });
  } catch (error) {
    return ctx.json(
      handleApiError(error, 'An unexpected error occurred during logout'),
      ErrorStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

const extractAuthToken = (ctx: AppContext | AuthContext): Nullable<string> => {
  const authHeader = ctx.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic')) return null;
  return authHeader.split(' ')[1];
};

const setAuthCookie = (ctx: AppContext | AuthContext, authToken: string) => {
  setCookie(ctx, AUTH_COOKIE_NAME, authToken, {
    maxAge: WEEK_TIME,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  });
};
