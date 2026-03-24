import type {
  Project,
  ProjectFilters,
  GetProjectsOptions,
  ProjectsData
} from '@shared/types/projects';

import { BaseRepository } from '@/core/base.repository';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';

class ProjectsRepository extends BaseRepository {
  constructor(env: Env) {
    super(env);
  }

  public async findMany(options?: GetProjectsOptions): Promise<ProjectsData> {
    const { page = DEFAULT_PAGE, perPage = DEFAULT_PER_PAGE, filters = {} } = options ?? {};
    const { whereClause, params } = this.buildWhereClause(filters);
    const offset = (page - 1) * perPage;

    const [total, projects] = await Promise.all([
      this.getTotalCount(whereClause, params),
      this.getData(whereClause, params, { limit: perPage, offset })
    ]);

    return {
      projects,
      metadata: this.buildMetadata(page, perPage, projects.length, total)
    };
  }

  public async findAll(filters?: ProjectFilters): Promise<Array<Project>> {
    const { whereClause, params } = this.buildWhereClause(filters ?? {});
    return this.getData(whereClause, params, { limit: Number.MAX_SAFE_INTEGER, offset: 0 });
  }

  private buildWhereClause(filters: ProjectFilters): {
    whereClause: string;
    params: unknown[];
  } {
    const filterMap: Record<string, [string, unknown]> = {
      name: ['name LIKE ?', `%${filters.name}%`],
      githubRepoId: ['github_repo_id = ?', filters.githubRepoId],
      syncedAfter: ['synced_at >= ?', filters.syncedAfter],
      syncedBefore: ['synced_at <= ?', filters.syncedBefore]
    };

    const conditions: string[] = [];
    const params: unknown[] = [];

    Object.entries(filterMap).forEach(([key, [condition, value]]) => {
      if (filters[key as keyof ProjectFilters]) {
        conditions.push(condition);
        params.push(value);
      }
    });

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  private async getTotalCount(whereClause: string, params: unknown[]): Promise<number> {
    const result = await this.prepareSQLQuery(
      `SELECT COUNT(*) as total FROM projects ${whereClause}`
    )
      .bind(...params)
      .first<{ total: number }>();

    return result?.total ?? 0;
  }

  private async getData(
    whereClause: string,
    params: unknown[],
    pagination: {
      limit: number;
      offset: number;
    }
  ): Promise<Array<Project>> {
    const { limit, offset } = pagination;

    const result = await this.prepareSQLQuery(
      `SELECT id, github_repo_id, name, html_url, latest_deployment_status, latest_deployment_at, synced_at FROM projects ${whereClause} ORDER BY latest_deployment_at DESC LIMIT ? OFFSET ?`
    )
      .bind(...params, limit, offset)
      .all<Project>();

    return result.results;
  }

  public async bulkUpsert(
    projects: Array<
      Pick<
        Project,
        'github_repo_id' | 'name' | 'html_url' | 'latest_deployment_status' | 'latest_deployment_at'
      >
    >
  ): Promise<{ upsertedCount: number }> {
    try {
      if (!projects.length) return { upsertedCount: 0 };

      const now = Math.floor(Date.now() / 1000);

      const sqlQuery = this.prepareSQLQuery(`INSERT OR REPLACE INTO projects 
        (github_repo_id, name, html_url, latest_deployment_status, latest_deployment_at, synced_at) 
        VALUES (?, ?, ?, ?, ?, ?)`);
      const statements = projects.map((project) =>
        sqlQuery.bind(
          project.github_repo_id,
          project.name,
          project.html_url,
          project.latest_deployment_status,
          project.latest_deployment_at,
          now
        )
      );

      const results = await this.batchSQLQuery<Project>(statements);

      return { upsertedCount: results.filter((result) => result.success).length };
    } catch (error) {
      console.error('An unexpected error occurred while bulk upserting projects', error);
      throw error;
    }
  }

  public async bulkDeleteByGithubRepoIds(
    githubRepoIds: string[]
  ): Promise<{ deletedCount: number }> {
    try {
      if (!githubRepoIds.length) return { deletedCount: 0 };

      const placeholders = githubRepoIds.map(() => '?').join(', ');
      const result = await this.prepareSQLQuery(
        `DELETE FROM projects WHERE github_repo_id IN (${placeholders})`
      )
        .bind(...githubRepoIds)
        .run();

      return { deletedCount: result.meta.changes ?? 0 };
    } catch (error) {
      console.error('An unexpected error occurred while bulk deleting projects', error);
      throw error;
    }
  }
}

export default ProjectsRepository;
