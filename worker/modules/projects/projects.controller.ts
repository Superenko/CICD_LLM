
import { GitHubService } from '@/services/github.service';
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

    const githubService = new GitHubService(ctx.env);
    const result = await githubService.triggerDeployWorkflowRun(projectData);

    const projectsService = new ProjectsService(ctx.env);
    ctx.executionCtx.waitUntil(
      projectsService.syncProjectsFromGithubRepos().catch(console.error)
    );

    return ctx.json(result);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during login'), 500);
  }
};

export const handleDeployProject = async (ctx: AuthContext) => {
  try {
    const body = await ctx.req.json<GithubDeploymentWorkflowInputs>();

    const githubService = new GitHubService(ctx.env);
    const deploymentResult = await githubService.triggerDeployWorkflowRun(body);

    const projectsService = new ProjectsService(ctx.env);
    ctx.executionCtx.waitUntil(
      projectsService.syncProjectsFromGithubRepos().catch(console.error)
    );

    return ctx.json(deploymentResult, 202);
  } catch (error) {
    return ctx.json(handleApiError(error, 'Failed to trigger deployment'), 500);
  }
};

export const handleGetProjectLatestDeployment = async (ctx: AuthContext) => {
  const { name } = ctx.req.param();

  try {
    const githubService = new GitHubService(ctx.env);
    const result = await githubService.getLatestWorkflowRunJob(name);

    const workflowRunJob = result?.workflowRunJob ?? null;
    const errorSummary = result?.errorSummary ?? null;
    const workflowRunStatus = result?.workflowRunStatus ?? null;

    // If the overall run is still in progress, show it as such, 
    // even if the specific job is finished, to wait for the entire pipeline.
    const effectiveStatus = workflowRunStatus !== 'completed' && workflowRunStatus !== null 
      ? workflowRunStatus 
      : (workflowRunJob?.status ?? null);

    const deployment = {
      project_name: name,
      version: 1,
      status: effectiveStatus,
      conclusion: workflowRunJob?.conclusion ?? null,
      logs: workflowRunJob?.steps ?? null,
      errorSummary: errorSummary ?? null
    };

    return ctx.json(deployment);
  } catch (error) {
    return ctx.json(handleApiError(error, 'Failed to fetch project deployment'), 500);
  }
};

export const handleSyncProjects = async (ctx: AuthContext) => {
  try {
    const projectsService = new ProjectsService(ctx.env);
    const syncResult = await projectsService.syncProjectsFromGithubRepos();
    return ctx.json(syncResult);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during project sync'), 500);
  }
};

export const handleGetIncidents = async (ctx: AuthContext) => {
  try {
    const { results } = await ctx.env.ASH_LIST_TASKS_DB.prepare(
      'SELECT id, project_name, run_id, category, severity, root_cause, solution, actionable_commands, created_at FROM incidents ORDER BY created_at DESC LIMIT 100'
    ).all();
    return ctx.json(results || []);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during incidents fetch'), 500);
  }
};

const parseProjectsQuery = (query: Record<string, string>) => {
  const { page, per_page } = query;

  return {
    page: Number(page) || DEFAULT_PAGE,
    perPage: Number(per_page) || DEFAULT_PER_PAGE
  };
};
