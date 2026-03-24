import { type Pagination } from '@shared/types/misc';

export interface Project {
  id: number;
  github_repo_id: string;
  name: string;
  html_url: string | null;
  latest_deployment_status: string | null;
  latest_deployment_at: number | null;
  synced_at: number;
}

export interface ProjectFilters {
  name?: string;
  githubRepoId?: string;
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
