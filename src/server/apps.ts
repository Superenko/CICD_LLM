
import type { AppDeployment, AppsData } from '@/types/app';
import type { GithubDeploymentWorkflowInputs } from '@/types/github';
import type { Incident } from '@shared/types/projects';

interface AppDeploymentTriggerResponse {
  runId: string;
}

const handleServerError = async (response: Response, message?: string) => {
  const responseBody = await response.json();
  const errorMessage = 'error' in responseBody ? responseBody.error : (message ?? 'Unknown error');
  throw new Error(errorMessage);
};

export const getApps = async (page: number = 1) => {
  const searchParams = new URLSearchParams({ page: page.toString() });

  const appsResponse = await fetch(`/api/projects?${searchParams.toString()}`, {
    credentials: 'include'
  });

  if (!appsResponse.ok) {
    await handleServerError(appsResponse, 'Failed to fetch apps');
  }

  const apps: AppsData = await appsResponse.json();
  return apps;
};

export const getIncidents = async (): Promise<Incident[]> => {
  const response = await fetch(`/api/projects/incidents`, {
    credentials: 'include'
  });

  if (!response.ok) {
    await handleServerError(response, 'Failed to fetch incidents');
  }

  return response.json();
};


export const getAppDeployment = async (appName: string) => {
  const appDeploymentResponse = await fetch(`/api/projects/${appName}/deployment`, {
    credentials: 'include'
  });

  if (!appDeploymentResponse.ok) {
    await handleServerError(appDeploymentResponse, 'Failed to fetch the latest deployment');
  }

  const projectDeployment: AppDeployment = await appDeploymentResponse.json();
  return projectDeployment;
};

export const createApp = async (inputs: GithubDeploymentWorkflowInputs) => {
  const createAppResponse = await fetch(`/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
    credentials: 'include'
  });

  if (!createAppResponse.ok) {
    await handleServerError(createAppResponse, 'Failed to create an app');
  }

  const createAppResponseBody: AppDeployment = await createAppResponse.json();
  return createAppResponseBody;
};

export const triggerAppDeployment = async (inputs: GithubDeploymentWorkflowInputs) => {
  const triggerDeploymentResponse = await fetch(`/api/projects/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs ?? {}),
    credentials: 'include'
  });

  if (!triggerDeploymentResponse.ok) {
    await handleServerError(triggerDeploymentResponse, 'Failed to trigger a deployment');
  }

  const triggerDeploymentResponseBody: AppDeploymentTriggerResponse =
    await triggerDeploymentResponse.json();

  const newDeploymentRunId = triggerDeploymentResponseBody.runId;
  return newDeploymentRunId;
};
