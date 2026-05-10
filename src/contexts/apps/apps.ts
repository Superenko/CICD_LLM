import { createContext } from 'react';

import type {
  AppDeployment,
  AppDeploymentState,
  AppDeploymentTriggerState,
  AppsData,
  AppsState,
  NewAppState
} from '@/types/app';

export interface AppsContextType {
  appsState: AppsState;
  appDeploymentState: AppDeploymentState;
  appDeploymentTriggerState: AppDeploymentTriggerState;
  createdAppState: NewAppState;
  fetchApps: (page?: number, isLoadMore?: boolean) => Promise<AppsData | undefined>;
  fetchLatestAppDeployment: (appName: string) => Promise<AppDeployment | undefined>;
  createApp: (inputs: Record<string, string>) => Promise<AppDeployment | undefined>;
  deployApp: (appName: string) => Promise<number | undefined>;
}

export const AppsContext = createContext<AppsContextType | undefined>(undefined);
