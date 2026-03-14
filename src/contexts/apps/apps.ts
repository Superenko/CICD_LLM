import type { ModelsData } from '@shared/types/models';

import { createContext } from 'react';

import type {
  AppDeployment,
  AppDeploymentState,
  AppDeploymentTriggerState,
  AppsData,
  AppsState,
  ModelsState,
  NewAppState
} from '@/types/app';

export interface AppsContextType {
  appsState: AppsState;
  appDeploymentState: AppDeploymentState;
  appDeploymentTriggerState: AppDeploymentTriggerState;
  createdAppState: NewAppState;
  modelsState: ModelsState;
  fetchApps: (page?: number, isLoadMore?: boolean) => Promise<AppsData | undefined>;
  fetchLatestAppDeployment: (appName: string) => Promise<AppDeployment | undefined>;
  fetchModels: () => Promise<ModelsData | undefined>;
  createApp: (modelName: string) => Promise<AppDeployment | undefined>;
  deployApp: (appName: string) => Promise<number | undefined>;
}

export const AppsContext = createContext<AppsContextType | undefined>(undefined);
