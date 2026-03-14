import { type Pagination } from '@shared/types/misc';

export interface Project {
  id: number;
  cloudflare_id: string;
  name: string;
  domains: string | null;
  latest_deployment_status: string | null;
  latest_deployment_at: number | null;
  synced_at: number;
}

export interface ProjectFilters {
  name?: string;
  cloudflareId?: string;
  syncedBefore?: number;
  syncedAfter?: number;
}

export interface GetProjectsOptions {
  filters?: ProjectFilters;
  page?: number;
  perPage?: number;
}

export interface ProjectsData {
  projects: Array<Project>;
  metadata: Pagination;
}
