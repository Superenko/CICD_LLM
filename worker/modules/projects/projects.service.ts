import type { GetProjectsOptions, Project, ProjectsData } from '@shared/types/projects';

import { SyncResult } from '@shared/types/misc';

import { GitHubService } from '@/services/github.service';
import { handleServiceError } from '@/utils/api';

import ProjectsRepository from './projects.repository';

export class ProjectsService {
  private readonly repository: ProjectsRepository;
  private readonly githubService: GitHubService;

  constructor(env: Env) {
    this.repository = new ProjectsRepository(env);
    this.githubService = new GitHubService(env);
  }

  public async getProjects(options?: GetProjectsOptions): Promise<ProjectsData> {
    try {
      return this.repository.findMany(options);
    } catch (error) {
      handleServiceError(
        error,
        'An unexpected error occurred while fetching projects from database'
      );
      throw error;
    }
  }

  public async syncProjectsFromGithubRepos(): Promise<SyncResult> {
    try {
      const repositories = await this.githubService.getRepositories();
      
      const remoteProjects = await Promise.all(
        repositories.map((repo: any) => this.mapGithubRepoToDB(repo))
      );

      const { upsertedCount } = await this.repository.bulkUpsert(remoteProjects);
      const { deletedCount } = await this.deleteMissingProjects(remoteProjects);

      console.log('🔄 GitHub projects synchronization completed', {
        upsertedCount,
        deletedCount
      });

      return { upsertedCount, deletedCount };
    } catch (error) {
      handleServiceError(
        error,
        'An unexpected error occurred while syncing projects from GitHub'
      );
      throw error;
    }
  }

  private async mapGithubRepoToDB(repo: any) {
    let deploymentStatus = null;
    let deploymentAt = null;

    try {
      const latestRunInfo = await this.githubService.getLatestWorkflowRunJob(repo.name);
      if (latestRunInfo && latestRunInfo.workflowRunJob) {
        deploymentStatus = latestRunInfo.workflowRunJob.conclusion ?? latestRunInfo.workflowRunJob.status;
        deploymentAt = latestRunInfo.workflowRunJob.completed_at 
          ? Math.floor(new Date(latestRunInfo.workflowRunJob.completed_at).getTime() / 1000)
          : latestRunInfo.workflowRunJob.started_at
          ? Math.floor(new Date(latestRunInfo.workflowRunJob.started_at).getTime() / 1000)
          : null;
      }
    } catch (error) {
      console.log(`No workflow runs found or error fetching for ${repo.name}`);
    }

    return {
      github_repo_id: repo.id?.toString() ?? '',
      name: repo.name ?? '',
      html_url: repo.html_url ?? null,
      latest_deployment_status: deploymentStatus as string | null,
      latest_deployment_at: deploymentAt
    };
  }

  private async deleteMissingProjects(
    remoteProjects: Pick<Project, 'github_repo_id'>[]
  ): Promise<{ deletedCount: number }> {
    const validGithubRepoIds = this.getValidGithubRepoIds(remoteProjects);
    const idsToDelete = await this.findProjectsToDelete(validGithubRepoIds);

    if (!idsToDelete.length) return { deletedCount: 0 };

    return this.repository.bulkDeleteByGithubRepoIds(idsToDelete);
  }

  private getValidGithubRepoIds(projects: Pick<Project, 'github_repo_id'>[]): Set<string> {
    return new Set(projects.map((p) => p.github_repo_id).filter((id): id is string => Boolean(id)));
  }

  private async findProjectsToDelete(validGithubRepoIds: Set<string>): Promise<string[]> {
    const existingProjects = await this.repository.findAll();
    return existingProjects
      .map((p) => p.github_repo_id)
      .filter((id): id is string => Boolean(id) && !validGithubRepoIds.has(id));
  }
}
