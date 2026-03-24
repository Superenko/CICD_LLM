import type { Project as CloudflareProject } from 'cloudflare/src/resources/pages.js';

import { MODEL_PAGES_PROJECT_SUFFIX } from '@shared/constants';
import { Nullable } from '@shared/types';
import { Pagination } from '@shared/types/misc';
import { extractModelName } from '@shared/utils';
import Cloudflare from 'cloudflare';

import { AirtableService } from '@/services/airtable.service';
import { GitHubService } from '@/services/github.service';
import { CloudflareResponse } from '@/types/cloudflare';
import { GithubDeploymentWorkflowInputs } from '@/types/github';
import { handleServiceError } from '@/utils/api';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';
import { getProjectName } from '@/utils/misc';

const CLOUDFLARE_API_BASE_URL = 'https://api.cloudflare.com/client/v4';

export class CloudflareService {
  private cloudflareClient: Nullable<Cloudflare> = null;
  private airtableService: AirtableService;
  private githubService: GitHubService;

  constructor(private readonly env: Env) {
    this.airtableService = new AirtableService(env);
    this.githubService = new GitHubService(env);
  }

  public async getProjects(
    pagination: Pagination = { page: DEFAULT_PAGE, per_page: DEFAULT_PER_PAGE }
  ): Promise<CloudflareResponse<CloudflareProject>> {
    const { page = DEFAULT_PAGE, per_page = DEFAULT_PER_PAGE } = pagination;
    const { accountId, apiToken } = await this.getCloudflareConfig();

    const projectsResponse = await fetch(
      `${CLOUDFLARE_API_BASE_URL}/accounts/${accountId}/pages/projects?page=${page}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      }
    );

    return projectsResponse.json<CloudflareResponse<CloudflareProject>>();
  }

  public async getAllProjects(): Promise<Array<CloudflareProject>> {
    const firstPageResponse = await this.getProjects({ page: 1 });
    const allProjects = firstPageResponse?.result ?? [];
    const totalPages = firstPageResponse?.result_info?.total_pages ?? 0;

    for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
      const pageResponse = await this.getProjects({ page: currentPage });
      const pageProjects = pageResponse?.result ?? [];
      allProjects.push(...pageProjects);
    }

    return allProjects;
  }

  public async getModelPagesProjects(): Promise<CloudflareProject[]> {
    const allProjects = await this.getAllProjects();
    return allProjects.filter(this.isModelPagesProject);
  }

  private isModelPagesProject(project: CloudflareProject): boolean {
    const { name } = project;
    if (!name) return false;
    return name.includes(MODEL_PAGES_PROJECT_SUFFIX) && name !== MODEL_PAGES_PROJECT_SUFFIX;
  }

  public async getProjectLatestDeployment(projectName: string) {
    try {
      const cloudflareClient = await this.getCloudflareClient();
      const { accountId } = await this.getCloudflareConfig();

      const projectDeployments = await cloudflareClient.pages.projects.deployments.list(
        projectName,
        {
          account_id: accountId
        }
      );

      const projectDeploymentsData = projectDeployments?.result ?? [];
      const deploymentVersion = projectDeploymentsData.length || 1;
      const latestDeployment = projectDeploymentsData[0] || {};

      const githubService = new GitHubService(this.env);
      const latestWorkflowRunJobResult = await githubService.getLatestWorkflowRunJob(projectName);

      const workflowRunJob = latestWorkflowRunJobResult?.workflowRunJob ?? null;
      const errorSummary = latestWorkflowRunJobResult?.errorSummary ?? null;

      return {
        project_name: latestDeployment?.project_name ?? projectName,
        version: deploymentVersion,
        status: workflowRunJob?.status ?? null,
        conclusion: workflowRunJob?.conclusion ?? null,
        logs: workflowRunJob?.steps ?? null,
        errorSummary: errorSummary ?? null
      };
    } catch (error) {
      handleServiceError(
        error,
        'An unexpected error occurred while fetching project latest deployment'
      );
    }
  }

  public async deployProject(workflowInputs: GithubDeploymentWorkflowInputs) {
    try {
      const { siteName } = workflowInputs;

      const modelName = extractModelName(siteName);
      if (!modelName) {
        throw new Error('Model name is required');
      }

      const { baseId, apiKey } = await this.airtableService.getAirtableCredentials();

      const githubService = new GitHubService(this.env);
      const workflowDispatchResult = await githubService.triggerDeployWorkflowRun({
        siteName,
        modelName,
        airtableBaseId: baseId,
        airtableKey: apiKey
      });

      return workflowDispatchResult;
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while deploying project');
    }
  }

  public async createProject(projectData: GithubDeploymentWorkflowInputs) {
    try {
      const cloudflareClient = await this.getCloudflareClient();
      const { accountId } = await this.getCloudflareConfig();

      // TODO: Convert special characters to hyphens (or underscores)
      const projectName = getProjectName(projectData.modelName);
      const { branch: productionBranch } = await this.githubService.getRepositoryConfig();

      await cloudflareClient.pages.projects.create({
        account_id: accountId,
        name: projectName,
        production_branch: productionBranch
      });

      await this.deployProject({
        siteName: projectName,
        modelName: projectData.modelName
      });

      const projectLatestDeployment = await this.getProjectLatestDeployment(projectName);

      return projectLatestDeployment;
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while creating a project');
    }
  }

  public async getCloudflareClient() {
    if (!this.cloudflareClient) {
      const { apiToken } = await this.getCloudflareConfig();
      this.cloudflareClient = new Cloudflare({ apiToken });
    }

    if (!this.cloudflareClient) {
      throw new Error('Cloudflare client is not properly configured');
    }

    return this.cloudflareClient;
  }

  public async getCloudflareConfig() {
    const apiToken = await this.env.ASH_LIST_TASKS_CF_TOKEN?.get();
    const accountId = await this.env.ASH_LIST_TASKS_CF_ACCOUNT_ID?.get();

    if (!apiToken || !accountId) {
      throw new Error('Cloudflare credentials are not configured.');
    }

    return {
      apiToken,
      accountId
    };
  }
}
