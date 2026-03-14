import ModelsService from '@/modules/models/models.service';
import { CloudflareService } from '@/services/cloudflare.service';
import { AuthContext } from '@/types/context';
import { GithubDeploymentWorkflowInputs } from '@/types/github';
import { handleApiError } from '@/utils/api';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';

import { ProjectsService } from './projects.service';

export const handleGetProjects = async (ctx: AuthContext) => {
  try {
    const query = ctx.req.query();
    const { page, perPage } = parseProjectsQuery(query);

    const projectsService = new ProjectsService(ctx.env);
    const projectsData = await projectsService.getProjects({ page, perPage });

    return ctx.json(projectsData);
  } catch (error) {
    return ctx.json(
      handleApiError(error, 'An unexpected error occurred during projects fetch'),
      500
    );
  }
};

export const handleCreateProject = async (ctx: AuthContext) => {
  try {
    const projectData = await ctx.req.json<GithubDeploymentWorkflowInputs>();
    if (!projectData.modelName) {
      throw new Error('Model name is required');
    }

    const cloudflareService = new CloudflareService(ctx.env);
    const project = await cloudflareService.createProject(projectData);

    const projectsService = new ProjectsService(ctx.env);
    const modelsService = new ModelsService(ctx.env);

    ctx.executionCtx.waitUntil(
      Promise.all([
        projectsService.syncModelPagesProjectsFromCloudflare(),
        modelsService.syncModels()
      ]).catch(console.error)
    );

    return ctx.json(project);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during login'), 500);
  }
};

export const handleDeployProject = async (ctx: AuthContext) => {
  try {
    const body = await ctx.req.json<GithubDeploymentWorkflowInputs>();

    const cloudflareService = new CloudflareService(ctx.env);
    const deploymentResult = await cloudflareService.deployProject(body);

    const projectsService = new ProjectsService(ctx.env);
    ctx.executionCtx.waitUntil(
      projectsService.syncModelPagesProjectsFromCloudflare().catch(console.error)
    );

    return ctx.json(deploymentResult, 202);
  } catch (error) {
    return ctx.json(handleApiError(error, 'Failed to trigger deployment'), 500);
  }
};

export const handleGetProjectLatestDeployment = async (ctx: AuthContext) => {
  const { name } = ctx.req.param();

  const cloudflareService = new CloudflareService(ctx.env);
  const project = await cloudflareService.getProjectLatestDeployment(name);

  return ctx.json(project);
};

export const handleSyncProjects = async (ctx: AuthContext) => {
  try {
    const projectsService = new ProjectsService(ctx.env);
    const syncResult = await projectsService.syncModelPagesProjectsFromCloudflare();
    return ctx.json(syncResult);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during project sync'), 500);
  }
};

const parseProjectsQuery = (query: Record<string, string>) => {
  const { page, per_page } = query;

  return {
    page: Number(page) || DEFAULT_PAGE,
    perPage: Number(per_page) || DEFAULT_PER_PAGE
  };
};
