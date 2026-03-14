import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import AuthService from '@/modules/auth/auth.service';
import { AuthContextInput } from '@/types/context';
import { ErrorStatusCode } from '@/types/misc';
import { AUTH_COOKIE_NAME } from '@/utils/constants';

export const requireAuth = createMiddleware<AuthContextInput>(async (ctx, next) => {
  const authToken = getCookie(ctx, AUTH_COOKIE_NAME);

  if (!authToken) {
    return ctx.json({ error: 'Unauthorized' }, ErrorStatusCode.UNAUTHORIZED);
  }

  const authService = new AuthService(ctx.env);
  const isAuthenticated = await authService.isAuthenticated(authToken);

  if (!isAuthenticated) {
    return ctx.json({ error: 'Unauthorized' }, ErrorStatusCode.UNAUTHORIZED);
  }

  ctx.set('authToken', authToken);

  await next();
});
