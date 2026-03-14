import type { Model, ModelFilters, GetModelsOptions, ModelsData } from '@shared/types/models';

import { BaseRepository } from '@/core/base.repository';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';

class ModelsRepository extends BaseRepository {
  constructor(env: Env) {
    super(env);
  }

  public async findMany(options?: GetModelsOptions): Promise<ModelsData> {
    const { page = DEFAULT_PAGE, perPage = DEFAULT_PER_PAGE, filters = {} } = options ?? {};
    const { whereClause, params } = this.buildWhereClause(filters);
    const offset = (page - 1) * perPage;

    const [total, models] = await Promise.all([
      this.getTotalCount(whereClause, params),
      this.getData(whereClause, params, { limit: perPage, offset })
    ]);

    return {
      models,
      metadata: this.buildMetadata(page, perPage, models.length, total)
    };
  }

  public async findAll(filters?: ModelFilters): Promise<Array<Model>> {
    const { whereClause, params } = this.buildWhereClause(filters ?? {});
    return this.getData(whereClause, params, { limit: Number.MAX_SAFE_INTEGER, offset: 0 });
  }

  public async findAllExcludingNames(excludedNames: string[]): Promise<ModelsData> {
    if (!excludedNames.length) {
      return this.findMany({ page: 1, perPage: Number.MAX_SAFE_INTEGER });
    }

    const placeholders = excludedNames.map(() => '?').join(',');
    const whereClause = `WHERE name NOT IN (${placeholders})`;

    const models = await this.getData(whereClause, excludedNames, {
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0
    });

    return {
      models,
      metadata: this.buildMetadata(1, models.length, models.length, models.length)
    };
  }

  private buildWhereClause(filters: ModelFilters): { whereClause: string; params: unknown[] } {
    const filterMap: Record<string, [string, unknown]> = {
      name: ['name LIKE ?', `%${filters.name}%`],
      syncedAfter: ['synced_at >= ?', filters.syncedAfter],
      syncedBefore: ['synced_at <= ?', filters.syncedBefore]
    };

    const conditions: string[] = [];
    const params: unknown[] = [];

    Object.entries(filterMap).forEach(([key, [condition, value]]) => {
      if (filters[key as keyof ModelFilters]) {
        conditions.push(condition);
        params.push(value);
      }
    });

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  private async getTotalCount(whereClause: string, params: unknown[]): Promise<number> {
    const result = await this.prepareSQLQuery(`SELECT COUNT(*) as total FROM models ${whereClause}`)
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
  ): Promise<Array<Model>> {
    const { limit, offset } = pagination;

    const result = await this.prepareSQLQuery(
      `SELECT id, name, synced_at FROM models ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`
    )
      .bind(...params, limit, offset)
      .all<Model>();

    return result.results;
  }

  public async bulkUpsert(modelNames: Model['name'][]): Promise<{ upsertedCount: number }> {
    try {
      if (!modelNames.length) return { upsertedCount: 0 };

      const now = Math.floor(Date.now() / 1000);

      const sqlQuery = this.prepareSQLQuery(
        'INSERT OR REPLACE INTO models (name, synced_at) VALUES (?, ?)'
      );
      const statements = modelNames.map((modelName) => sqlQuery.bind(modelName, now));
      const results = await this.batchSQLQuery<Model>(statements);

      return { upsertedCount: results.filter((result) => result.success).length };
    } catch (error) {
      console.error('An unexpected error occurred while bulk upserting models', error);
      throw error;
    }
  }

  public async bulkDelete(modelNames: Model['name'][]): Promise<{ deletedCount: number }> {
    if (!modelNames.length) return { deletedCount: 0 };

    const placeholders = modelNames.map(() => '?').join(', ');
    const result = await this.prepareSQLQuery(`DELETE FROM models WHERE name IN (${placeholders})`)
      .bind(...modelNames)
      .run();

    return { deletedCount: result.meta.changes ?? 0 };
  }
}

export default ModelsRepository;
