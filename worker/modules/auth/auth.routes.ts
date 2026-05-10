import { Hono } from 'hono';

import { requireAuth } from '@/middlewares/auth';

import { handleLogin, handleLogout, handleRegister, handleVerifyAuthentication } from './auth.controller';

const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/login', handleLogin);
authRouter.post('/register', handleRegister);
authRouter.get('/verify', requireAuth, handleVerifyAuthentication);
authRouter.post('/logout', requireAuth, handleLogout);

export default authRouter;
