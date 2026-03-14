import { Hono } from 'hono';

import { requireAuth } from '@/middlewares/auth';

import { handleGetModels, handleSyncModels } from './models.controller';

const modelsRouter = new Hono<{ Bindings: Env }>();

modelsRouter.use(requireAuth);

modelsRouter.get('/', handleGetModels);
modelsRouter.post('/sync', handleSyncModels);

export default modelsRouter;
