import { Hono } from 'hono';

import authRouter from '@/modules/auth/auth.routes';
import modelsRouter from '@/modules/models/models.routes';
import projectsRouter from '@/modules/projects/projects.routes';
import { AppContextInput } from '@/types/context';

const apiRouter = new Hono<AppContextInput>();

apiRouter.route('/auth', authRouter);
apiRouter.route('/projects', projectsRouter);
apiRouter.route('/models', modelsRouter);

export default apiRouter;
