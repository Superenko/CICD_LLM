import { useCallback, useState, type ReactNode } from 'react';

import type {
  AppDeployment,
  AppDeploymentState,
  AppDeploymentTriggerState,
  AppsData,
  AppsState,
  NewAppState
} from '@/types/app';

import {
  createApp,
  getAppDeployment,
  getApps,
  triggerAppDeployment
} from '@/server/apps';

import { AppsContext, type AppsContextType } from './apps';

export const AppsProvider = ({ children }: { children: ReactNode }) => {
  const [appsState, setAppsState] = useState<AppsState>({
    appsData: null,
    isAppsLoading: true,
    isLoadingMore: false,
    appsError: null
  });

  const [appDeploymentState, setAppDeploymentState] = useState<AppDeploymentState>({
    appDeployment: null,
    isAppDeploymentLoading: true,
    appDeploymentError: null
  });

  const [appDeploymentTriggerState, setAppDeploymentTriggerState] =
    useState<AppDeploymentTriggerState>({
      runId: null,
      requestedAppDeployments: [],
      appDeploymentRequestError: null
    });

  const [createdAppState, setCreatedAppState] = useState<NewAppState>({
    app: null,
    isCreatingApp: false,
    createAppError: null
  });


  const fetchApps = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      setAppsState((prev) => ({
        ...prev,
        isAppsLoading: !isLoadMore,
        isLoadingMore: isLoadMore,
        appsError: null
      }));

      const appsData: AppsData = await getApps(page);

      setAppsState((prev) => ({
        ...prev,
        appsData: isLoadMore
          ? {
              ...prev.appsData,
              projects: [...(prev.appsData?.projects ?? []), ...(appsData?.projects ?? [])],
              metadata: appsData?.metadata
            }
          : appsData,
        appsError: null
      }));

      return appsData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch apps. Please, reload the page or try again later.';

      setAppsState((prev) => ({
        ...prev,
        appsData: isLoadMore ? prev.appsData : null,
        appsError: errorMessage
      }));
    } finally {
      setAppsState((prev) => ({
        ...prev,
        isAppsLoading: false,
        isLoadingMore: false
      }));
    }
  }, []);

  const fetchLatestAppDeployment = useCallback(async (appName: string) => {
    try {
      setAppDeploymentState((prev) => ({
        ...prev,
        isAppDeploymentLoading: true,
        appDeploymentError: null
      }));

      const projectDeployment: AppDeployment = await getAppDeployment(appName);

      setAppDeploymentState((prev) => ({
        ...prev,
        appDeployment: projectDeployment,
        appDeploymentError: null
      }));

      return projectDeployment;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch the app latest deployment. Please, reload the page or try again later.';

      setAppDeploymentState((prev) => ({
        ...prev,
        appDeployment: null,
        appDeploymentError: errorMessage
      }));
    } finally {
      setAppDeploymentState((prev) => ({
        ...prev,
        isAppDeploymentLoading: false
      }));
    }
  }, []);


  const handleCreateApp = useCallback(async (inputs: Record<string, string>) => {
    try {
      setCreatedAppState((prev) => ({
        ...prev,
        isCreatingApp: true,
        createAppError: null
      }));

      const newApp = await createApp(inputs);

      setCreatedAppState((prev) => ({
        ...prev,
        app: newApp,
        createAppError: null
      }));

      return newApp;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create app. Please, try again later.';

      setCreatedAppState((prev) => ({
        ...prev,
        app: null,
        createAppError: errorMessage
      }));
    } finally {
      setCreatedAppState((prev) => ({
        ...prev,
        isCreatingApp: false
      }));
    }
  }, []);

  const deployApp = useCallback(async (appName: string) => {
    try {
      setAppDeploymentTriggerState((prev) => ({
        ...prev,
        requestedAppDeployments: [...prev.requestedAppDeployments, appName],
        appDeploymentRequestError: null
      }));

      const newDeploymentRunId = await triggerAppDeployment({ siteName: appName });

      if (!newDeploymentRunId) {
        throw new Error('Failed to trigger page deployment.');
      }

      const newDeploymentRunIdNumber = Number(newDeploymentRunId);

      setAppDeploymentTriggerState((prev) => ({
        ...prev,
        runId: newDeploymentRunIdNumber,
        appDeploymentRequestError: null
      }));

      return newDeploymentRunIdNumber;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to trigger page deployment. Please try again later.';

      setAppDeploymentTriggerState((prev) => ({
        ...prev,
        runId: null,
        appDeploymentRequestError: errorMessage
      }));
    } finally {
      setAppDeploymentTriggerState((prev) => ({
        ...prev,
        requestedAppDeployments: prev.requestedAppDeployments.filter((name) => name !== appName)
      }));
    }
  }, []);

  const value: AppsContextType = {
    appsState,
    appDeploymentState,
    appDeploymentTriggerState,
    createdAppState,
    fetchApps,
    fetchLatestAppDeployment,
    createApp: handleCreateApp,
    deployApp
  };

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
};
