import { Hono } from 'hono';

import { requireAuth } from '@/middlewares/auth';

import {
  handleCreateProject,
  handleDeployProject,
  handleGetProjectLatestDeployment,
  handleGetProjects,
  handleSyncProjects,
  handleGetIncidents
} from './projects.controller';

const projectsRouter = new Hono<{ Bindings: Env }>();

projectsRouter.use(requireAuth);

projectsRouter.get('/', handleGetProjects);
projectsRouter.get('/incidents', handleGetIncidents);
projectsRouter.post('/', handleCreateProject);
projectsRouter.post('/deploy', handleDeployProject);
projectsRouter.post('/sync', handleSyncProjects);
projectsRouter.get('/:name/deployment', handleGetProjectLatestDeployment);

export default projectsRouter;
