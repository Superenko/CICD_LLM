import { Pagination } from '@shared/types/misc';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';

export abstract class BaseRepository {
  constructor(protected readonly env: Env) {}

  protected prepareSQLQuery(sql: string): D1PreparedStatement {
    return this.env.ASH_LIST_TASKS_DB.prepare(sql);
  }

  protected async batchSQLQuery<T = unknown>(
    statements: D1PreparedStatement[]
  ): Promise<D1Result<T>[]> {
    return this.env.ASH_LIST_TASKS_DB.batch(statements);
  }

  protected buildMetadata(page: number, perPage: number, count: number, total: number): Pagination {
    return {
      page,
      per_page: perPage,
      count,
      total_count: total,
      total_pages: Math.max(1, Math.ceil(total / perPage))
    };
  }

  protected getPaginationDefaults() {
    return {
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE
    };
  }

  protected calculateOffset(page: number, perPage: number): number {
    return (page - 1) * perPage;
  }
}
