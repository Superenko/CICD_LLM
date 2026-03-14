export type GithubWorkflowJobStepStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'waiting'
  | 'requested'
  | 'pending';

export type GithubWorkflowJobStepConclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'action_required';

export interface GithubWorkflowJobStep {
  name: string;
  status: GithubWorkflowJobStepStatus;
  conclusion: GithubWorkflowJobStepConclusion | null;
  number: number;
  details?: unknown[];
  started_at?: string | null;
  completed_at?: string | null;
}

export type GithubDeploymentWorkflowInputs = {
  run_id?: string;
  modelName?: string;
  siteName?: string;
};
