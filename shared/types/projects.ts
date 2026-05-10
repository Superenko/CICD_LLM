import { type Pagination } from '@shared/types/misc';

export interface Project {
  id: number;
  github_repo_id: string;
  name: string;
  html_url: string | null;
  latest_deployment_status: string | null;
  latest_deployment_at: number | null;
  total_runs: number;
  failed_runs: number;
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

export interface WorkflowRun {
  id: number;
  project_name: string;
  run_id: string;
  status: string | null;
  conclusion: string | null;
  triggered_by: string | null;
  started_at: number | null;
  completed_at: number | null;
  duration_seconds: number | null;
  created_at: number;
}

export interface Incident {
  id: number;
  project_name: string;
  run_id: string;
  category: string;
  severity: string | null;
  root_cause: string | null;
  solution: string;
  actionable_commands: string | null; // JSON array as text
  llm_model: string | null;
  confidence_score: number | null;
  raw_log_snippet: string | null;
  created_at: number;
}
