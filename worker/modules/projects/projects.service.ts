import type { GetProjectsOptions, Project, ProjectsData } from '@shared/types/projects';
import type { Project as CloudflareProject } from 'cloudflare/src/resources/pages.js';

import { SyncResult } from '@shared/types/misc';

import { CloudflareService } from '@/services/cloudflare.service';
import { handleServiceError } from '@/utils/api';

import ProjectsRepository from './projects.repository';

export class ProjectsService {
  private readonly repository: ProjectsRepository;
  private readonly cloudflareService: CloudflareService;

  constructor(env: Env) {
    this.repository = new ProjectsRepository(env);
    this.cloudflareService = new CloudflareService(env);
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

  public async syncModelPagesProjectsFromCloudflare(): Promise<SyncResult> {
    try {
      const modelPagesProjects = await this.cloudflareService.getModelPagesProjects();
      const remoteProjects = modelPagesProjects.map(this.mapCloudflareProjectToDB);

      const { upsertedCount } = await this.repository.bulkUpsert(remoteProjects);
      const { deletedCount } = await this.deleteMissingProjects(remoteProjects);

      console.log('🔄 Cloudflare projects synchronization completed', {
        upsertedCount,
        deletedCount
      });

      return { upsertedCount, deletedCount };
    } catch (error) {
      handleServiceError(
        error,
        'An unexpected error occurred while syncing projects from Cloudflare'
      );
      throw error;
    }
  }

  private mapCloudflareProjectToDB(project: CloudflareProject) {
    const latestDeployment = project.latest_deployment;
    const deploymentStatus = latestDeployment?.latest_stage?.status ?? null;

    const deploymentAt = latestDeployment?.created_on
      ? Math.floor(new Date(latestDeployment.created_on).getTime() / 1000)
      : null;

    return {
      cloudflare_id: project.id ?? '',
      name: project.name ?? '',
      domains: project.domains?.join(',') ?? null,
      latest_deployment_status: deploymentStatus,
      latest_deployment_at: deploymentAt
    };
  }

  private async deleteMissingProjects(
    remoteProjects: Pick<Project, 'cloudflare_id'>[]
  ): Promise<{ deletedCount: number }> {
    const validCloudflareIds = this.getValidCloudflareIds(remoteProjects);
    const idsToDelete = await this.findProjectsToDelete(validCloudflareIds);

    if (!idsToDelete.length) return { deletedCount: 0 };

    return this.repository.bulkDeleteByCloudflareIds(idsToDelete);
  }

  private getValidCloudflareIds(projects: Pick<Project, 'cloudflare_id'>[]): Set<string> {
    return new Set(projects.map((p) => p.cloudflare_id).filter((id): id is string => Boolean(id)));
  }

  private async findProjectsToDelete(validCloudflareIds: Set<string>): Promise<string[]> {
    const existingProjects = await this.repository.findAll();
    return existingProjects
      .map((p) => p.cloudflare_id)
      .filter((id): id is string => Boolean(id) && !validCloudflareIds.has(id));
  }
}
