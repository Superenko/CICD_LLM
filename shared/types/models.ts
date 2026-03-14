import { type Pagination } from '@shared/types/misc';

export interface Model {
  id: number;
  name: string;
  synced_at: number;
}

export interface ModelFilters {
  name?: string;
  syncedBefore?: number;
  syncedAfter?: number;
}

export interface GetModelsOptions {
  filters?: ModelFilters;
  page?: number;
  perPage?: number;
}

export interface ModelsData {
  models: Array<Model>;
  metadata: Pagination;
}
