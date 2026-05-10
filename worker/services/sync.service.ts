import { ProjectsService } from '@/modules/projects/projects.service';

export class SyncService {
  private readonly projectsService: ProjectsService;

  constructor(env: Env) {
    this.projectsService = new ProjectsService(env);
  }

  public async syncAll(): Promise<void> {
    await this.syncProjects();
  }

  private async syncProjects(): Promise<void> {
    try {
      await this.projectsService.syncProjectsFromGithubRepos();
    } catch (error) {
      console.error('Error syncing projects from GitHub:', error);
      throw error;
    }
  }
}
