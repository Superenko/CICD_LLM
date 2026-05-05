import type { Pagination } from '@shared/types/misc';
import type { ModelsData } from '@shared/types/models';
import type { Project } from '@shared/types/projects';

import type { Deployment, Stage } from './cloudflare';
import type {
  GithubWorkflowJobStep,
  GithubWorkflowJobStepConclusion,
  GithubWorkflowJobStepStatus
} from './github';

export interface AppDeployment extends Pick<Deployment, 'project_name'> {
  status: GithubWorkflowJobStepStatus;
  conclusion: GithubWorkflowJobStepConclusion | null;
  version: number;
  logs: GithubWorkflowJobStep[] | null;
  errorSummary: { category: string; solution: string } | string | null;
}

export interface AppsData {
  projects: Project[];
  metadata: Pagination;
}

export interface AppsState {
  appsData: AppsData | null;
  isAppsLoading: boolean;
  isLoadingMore: boolean;
  appsError: string | null;
}

export interface AppDeploymentState {
  appDeployment: AppDeployment | null;
  isAppDeploymentLoading: boolean;
  appDeploymentError: string | null;
}

export interface AppDeploymentTriggerState {
  runId: number | null;
  requestedAppDeployments: string[];
  appDeploymentRequestError: string | null;
}

export interface NewAppState {
  app: AppDeployment | null;
  isCreatingApp: boolean;
  createAppError: string | null;
}

export interface ModelsState {
  modelsData: ModelsData;
  isModelsLoading: boolean;
  modelsError: string | null;
}

export type AppStatus = Stage['status'];

export interface AppLogItemData {
  message: string;
  timestamp: string;
}

export interface AppLogItem {
  data: AppLogItemData;
}

export interface AppLogNode {
  name: string;
  items: AppLogItem[];
}

export interface AppLog {
  log: AppLogNode[] | null;
}
