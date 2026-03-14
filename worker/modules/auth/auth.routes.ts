import { Hono } from 'hono';

import { requireAuth } from '@/middlewares/auth';

import { handleLogin, handleLogout, handleVerifyAuthentication } from './auth.controller';

const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/login', handleLogin);
authRouter.get('/verify', requireAuth, handleVerifyAuthentication);
authRouter.post('/logout', requireAuth, handleLogout);

export default authRouter;
