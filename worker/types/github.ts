export interface GithubWorkflowRun {
  id: number;
  name: string | null;
  event: string;
  status: string | null;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
}

export interface GithubWorkflowRunJob {
  id: number;
  name: string | null;
  status?: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
  conclusion?:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  steps?: GithubWorkflowRunJobStep[];
}

export interface GithubWorkflowRunJobStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  number: number;
  started_at?: string | null;
  completed_at?: string | null;
}

export type GithubDeploymentWorkflowInputs = {
  run_id?: string;
  modelName: string;
  siteName?: string;
  airtableBaseId?: string;
  airtableKey?: string;
};

export interface GithubJobErrorLine {
  lineNumber: number;
  line: string;
}

export interface GithubWorkflowRunErrors {
  jobId: number;
  jobName?: string | null;
  errorLines: GithubJobErrorLine[];
}
