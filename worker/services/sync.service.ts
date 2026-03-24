import ModelsService from '@/modules/models/models.service';
import { ProjectsService } from '@/modules/projects/projects.service';

export class SyncService {
  private readonly modelsService: ModelsService;
  private readonly projectsService: ProjectsService;

  constructor(env: Env) {
    this.modelsService = new ModelsService(env);
    this.projectsService = new ProjectsService(env);
  }

  public async syncAll(): Promise<void> {
    await Promise.allSettled([this.syncModels(), this.syncProjects()]);
  }

  private async syncModels(): Promise<void> {
    try {
      await this.modelsService.syncModels();
    } catch (error) {
      console.error('Error syncing models from Airtable:', error);
      throw error;
    }
  }

  private async syncProjects(): Promise<void> {
    try {
      await this.projectsService.syncProjectsFromGithubRepos();
    } catch (error) {
      console.error('Error syncing projects from Cloudflare:', error);
      throw error;
    }
  }
}
