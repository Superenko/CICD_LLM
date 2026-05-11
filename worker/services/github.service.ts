import { request } from '@octokit/request';
import { gunzipSync, strFromU8 } from 'fflate';

import {
  GithubDeploymentWorkflowInputs,
  GithubWorkflowRun,
  GithubWorkflowRunErrors,
  GithubWorkflowRunJob
} from '@/types/github';
import { handleServiceError } from '@/utils/api';
import {
  KV_JOB_LOGS_KEY,
  KV_RUN_ERRORS_KEY,
  KV_RUN_SUMMARY_KEY,
  WEEK_TIME
} from '@/utils/constants';
import { extractErrorLines } from '@/utils/logs';
import { sleep } from '@/utils/misc';

import { GeminiService, GEMINI_MODEL } from './gemini.service';

const WORKFLOW_RUNS_PER_PAGE = 30;

export class GitHubService {
  constructor(private readonly env: Env) {}

  private async getDeploymentWorkflow(repoName: string) {
    try {
      const { owner } = await this.getRepositoryConfig();

      const defaultHeaders = await this.buildDefaultHeaders();

      const workflows = await request('GET /repos/{owner}/{repo}/actions/workflows', {
        owner,
        repo: repoName,
        headers: {
          ...defaultHeaders
        }
      });

      const workflowFilename = await this.getWorkflowFilename();
      const filenameWithoutExt = workflowFilename.split('.')[0];
      
      const targetWorkflow = workflows.data.workflows?.find((wf) =>
        wf.path.includes(workflowFilename) || wf.path.includes(`${filenameWithoutExt}.yaml`) || wf.path.includes(`${filenameWithoutExt}.yml`)
      );

      return targetWorkflow;
    } catch (error) {
      handleServiceError(error, 'Failed to fetch workflow by name');
    }
  }

  private async getWorkflowRunByProjectName(projectName: string, queryParamsString?: string) {
    try {
      const { owner, branch } = await this.getRepositoryConfig();

      const queryParams =
        queryParamsString ??
        new URLSearchParams({
          branch,
          per_page: WORKFLOW_RUNS_PER_PAGE.toString()
        }).toString();

      const defaultHeaders = await this.buildDefaultHeaders();

      const workflowRunsResponse = await request(
        `GET /repos/{owner}/{repo}/actions/runs?${queryParams}`,
        {
          owner,
          repo: projectName,
          headers: { ...defaultHeaders }
        }
      );

      const linkHeader = workflowRunsResponse.headers.link;

      const workflowRuns = (workflowRunsResponse.data.workflow_runs ??
        []) as unknown as GithubWorkflowRun[];

      const workflowRun = workflowRuns.find(
        (run) => run.event === 'workflow_dispatch' || run.event === 'push'
      );

      return { workflowRun, linkHeader };
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while fetching latest workflow run');
    }
  }

  private async searchLatestWorkflowRun(projectName: string, initialPage = 1) {
    const { branch } = await this.getRepositoryConfig();

    const nextLinkPattern = /<([^>]+)>;\s*rel="next"/i;

    let currentPage = initialPage;
    let foundWorkflowRun: GithubWorkflowRun | undefined = undefined;

    let queryParams = new URLSearchParams({
      branch,
      per_page: WORKFLOW_RUNS_PER_PAGE.toString()
    });

    while (!foundWorkflowRun) {
      currentPage++;

      if (currentPage - 1 === initialPage) {
        queryParams.set('page', currentPage.toString());
      }

      const workflowRunResponse = await this.getWorkflowRunByProjectName(
        projectName,
        queryParams.toString()
      );
      const { workflowRun, linkHeader } = workflowRunResponse ?? {};

      if (workflowRun) {
        foundWorkflowRun = workflowRun;
        return foundWorkflowRun;
      }

      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextLinkMatch = linkHeader.match(nextLinkPattern);

        if (nextLinkMatch && nextLinkMatch[1]) {
          const nextLink = new URL(nextLinkMatch[1]);
          queryParams = new URLSearchParams(nextLink.search);
        } else {
          return foundWorkflowRun;
        }
      } else {
        return foundWorkflowRun;
      }
    }

    return foundWorkflowRun;
  }

  public async getLatestWorkflowRunInfo(projectName: string) {
    try {
      const workflowRunResponse = await this.getWorkflowRunByProjectName(projectName);
      const { workflowRun: latestWorkflowRun } = workflowRunResponse ?? {};
      let foundRun = latestWorkflowRun;

      if (!foundRun?.id) {
        foundRun = await this.searchLatestWorkflowRun(projectName);
      }

      if (foundRun) {
        // Optimistically save the latest run when fetching project info
        this.saveWorkflowRunToDB(foundRun, projectName).catch(console.error);
        
        return {
          status: foundRun.status,
          conclusion: foundRun.conclusion,
          completed_at: foundRun.updated_at || null,
          started_at: foundRun.created_at || null
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async saveWorkflowRunToDB(workflowRun: GithubWorkflowRun, projectName: string, workflowRunJob?: GithubWorkflowRunJob | null) {
    try {
      const startedAt = workflowRun.created_at ? Math.floor(new Date(workflowRun.created_at).getTime() / 1000) : null;
      const completedAt = workflowRun.updated_at ? Math.floor(new Date(workflowRun.updated_at).getTime() / 1000) : null;
      
      const status = workflowRun.status || workflowRunJob?.status || null;
      const conclusion = workflowRun.conclusion || workflowRunJob?.conclusion || null;

      await this.env.ASH_LIST_TASKS_DB.prepare(
        `INSERT INTO workflow_runs (project_name, run_id, status, conclusion, triggered_by, started_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(run_id) DO UPDATE SET 
           status=excluded.status, 
           conclusion=excluded.conclusion, 
           completed_at=excluded.completed_at`
      ).bind(
        projectName,
        workflowRun.id.toString(),
        status,
        conclusion,
        workflowRun.event,
        startedAt,
        completedAt
      ).run();

      // Update project metrics automatically
      await this.env.ASH_LIST_TASKS_DB.prepare(
        `UPDATE projects
         SET total_runs = (SELECT COUNT(*) FROM workflow_runs WHERE project_name = ? AND conclusion IS NOT NULL),
             failed_runs = (SELECT COUNT(*) FROM workflow_runs WHERE project_name = ? AND conclusion = 'failure')
         WHERE name = ?`
      ).bind(projectName, projectName, projectName).run();
    } catch (error) {
      console.error('[LLM-flow] Failed to save workflow run or update metrics:', error);
    }
  }

  public async getLatestWorkflowRunJob(projectName: string) {
    try {
      const workflowRunResponse = await this.getWorkflowRunByProjectName(projectName);
      const { workflowRun: latestWorkflowRun } = workflowRunResponse ?? {};

      let latestWorkflowRunId = latestWorkflowRun?.id;

      if (!latestWorkflowRunId) {
        const foundWorkflowRun = await this.searchLatestWorkflowRun(projectName);
        latestWorkflowRunId = foundWorkflowRun?.id;
      }

      if (!latestWorkflowRunId) {
        throw new Error('Workflow run not found');
      }

      console.log(`[LLM-flow] runId=${latestWorkflowRunId}, project=${projectName}`);

      const workflowRunLogs = await this.getWorkflowRunJobErrors(latestWorkflowRunId, projectName);
      console.log(`[LLM-flow] errorLines=${workflowRunLogs?.errorLines?.length ?? 0}`);

      let errorSummary: { category: string; severity?: string; root_cause?: string; solution: string; actionable_commands?: string[]; confidence_score?: number } | null | undefined = null;

      const geminiService = new GeminiService(this.env);
      const workflowYaml = await this.getWorkflowYamlContent(projectName);
      
      const summaryKey = `${KV_RUN_SUMMARY_KEY}:${latestWorkflowRunId}`;
      const cachedSummary = await this.env.WORKFLOW_RUN_LOGS.get(summaryKey);

      if (cachedSummary) {
        try {
          errorSummary = JSON.parse(cachedSummary);
        } catch (e) {
          errorSummary = { category: 'Unknown', solution: cachedSummary };
        }
      } else if (workflowRunLogs?.errorLines?.length) {
        try {
          const summary = await geminiService.analyzeLogs(workflowRunLogs.errorLines, workflowYaml ?? undefined);
          errorSummary = summary ?? null;

          if (errorSummary) {
            await this.env.WORKFLOW_RUN_LOGS.put(summaryKey, JSON.stringify(errorSummary), {
              expirationTtl: WEEK_TIME
            });

            try {
              const cmds = Array.isArray(errorSummary.actionable_commands)
                ? JSON.stringify(errorSummary.actionable_commands)
                : null;
              
              // Get the first error line as a raw snippet
              const rawLogSnippet = workflowRunLogs.errorLines.length > 0 
                ? workflowRunLogs.errorLines[0].line.slice(0, 1000) 
                : null;

              await this.env.ASH_LIST_TASKS_DB.prepare(
                `INSERT OR IGNORE INTO incidents 
                (project_name, run_id, category, severity, root_cause, solution, actionable_commands, llm_model, confidence_score, raw_log_snippet) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                projectName,
                latestWorkflowRunId.toString(),
                errorSummary.category,
                errorSummary.severity ?? null,
                errorSummary.root_cause ?? null,
                errorSummary.solution,
                cmds,
                GEMINI_MODEL,
                errorSummary.confidence_score ?? null,
                rawLogSnippet
              ).run();
            } catch (dbError) {
              console.error('[LLM-flow] Failed to save incident to DB:', dbError);
            }
          }
        } catch (aiError) {
          console.error('[LLM-flow] Gemini call failed:', aiError);
        }
      }

      const workflowRunJob = await this.getWorkflowRunJob(latestWorkflowRunId, projectName);
      
      const workflowRunStatus = latestWorkflowRun?.status || workflowRunJob?.status;
      const workflowRunConclusion = latestWorkflowRun?.conclusion || workflowRunJob?.conclusion;

      // Save workflow run to DB
      if (latestWorkflowRun) {
        await this.saveWorkflowRunToDB(latestWorkflowRun, projectName, workflowRunJob);
      }

      return { 
        workflowRunJob, 
        errorSummary, 
        workflowRunStatus
      };
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while fetching latest workflow run');
      return null;
    }
  }

  public async getWorkflowRunJob(runId: number, repoName: string): Promise<GithubWorkflowRunJob | null | undefined> {
    try {
      const githubToken = await this.getGitHubToken();
      const { owner } = await this.getRepositoryConfig();

      const jobs = await request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs', {
        owner,
        repo: repoName,
        run_id: runId,
        headers: {
          authorization: `token ${githubToken}`
        }
      });

      const allJobs = jobs.data.jobs ?? [];
      const failedJob = allJobs.find(job => job.conclusion === 'failure' || job.conclusion === 'timed_out');
      const inProgressJob = allJobs.find(job => job.status === 'in_progress' || job.status === 'queued');
      const workflowRunJob = failedJob || inProgressJob || allJobs[allJobs.length - 1];
      
      return workflowRunJob;
    } catch (error) {
      handleServiceError(error, 'Failed to fetch workflow job by run id');
    }
  }

  private async getWorkflowRunJobLogs(jobId: number, repoName: string) {
    try {
      const jobLogsKey = `${KV_JOB_LOGS_KEY}:${jobId}`;

      const cachedJobLogs = await this.env.WORKFLOW_RUN_LOGS.get(jobLogsKey);
      if (cachedJobLogs) return cachedJobLogs;

      const { owner } = await this.getRepositoryConfig();

      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/actions/jobs/${jobId}/logs`;
      const defaultHeaders = await this.buildDefaultHeaders();

      const initialResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: { ...defaultHeaders, 'user-agent': 'llm-app-worker' },
        redirect: 'manual'
      });

      const redirectUrl = initialResponse.headers.get('location');
      if (!redirectUrl) return null;

      const blobResponse = await fetch(redirectUrl, { method: 'GET' });
      if (!blobResponse.ok) {
        throw new Error(`Failed to download job logs. Status: ${blobResponse.status}`);
      }

      const encoding = blobResponse.headers.get('content-encoding')?.toLowerCase() ?? '';
      const contentType = blobResponse.headers.get('content-type')?.toLowerCase() ?? '';
      const isGzipped = encoding.includes('gzip') || contentType.includes('gzip');

      let text: string;

      if (isGzipped) {
        const arrayBuffer = await blobResponse.arrayBuffer();
        const unzipped = gunzipSync(new Uint8Array(arrayBuffer));
        text = strFromU8(unzipped);
      } else {
        text = await blobResponse.text();
      }

      await this.env.WORKFLOW_RUN_LOGS.put(jobLogsKey, text, {
        expirationTtl: WEEK_TIME
      });

      return text;
    } catch (error) {
      handleServiceError(error, 'Failed to fetch workflow run logs by run id');
    }
  }

  public async getWorkflowRunJobErrors(runId: number, repoName: string): Promise<GithubWorkflowRunErrors | null> {
    try {
      const runErrorsKey = `${KV_RUN_ERRORS_KEY}:${runId}`;

      const cachedRunErrors = await this.env.WORKFLOW_RUN_LOGS.get<GithubWorkflowRunErrors>(
        runErrorsKey,
        { type: 'json' }
      );

      // Skip cache if it had empty errorLines (old run or no patterns matched)
      if (cachedRunErrors && cachedRunErrors.errorLines.length > 0) return cachedRunErrors;

      const workflowRunJob = await this.getWorkflowRunJob(runId, repoName);
      const { id: jobId, name: jobName } = workflowRunJob ?? {};

      const isAnalyzableJob = ['failure', 'timed_out'].includes(workflowRunJob?.conclusion ?? '');
      console.log(`[LLM-flow] job conclusion="${workflowRunJob?.conclusion}", isAnalyzableJob=${isAnalyzableJob}, jobId=${jobId}`);
      if (!jobId || !isAnalyzableJob) return null;

      const jobLogs = await this.getWorkflowRunJobLogs(jobId, repoName);
      console.log(`[LLM-flow] jobLogs length=${jobLogs?.length ?? 0}, preview=${jobLogs?.slice(-200)}`);
      if (!jobLogs) return null;

      let errorLines = extractErrorLines(jobLogs);
      console.log(`[LLM-flow] extractErrorLines found=${errorLines.length}`, errorLines.slice(0, 3).map(l => l.line));

      // Fallback: if no specific error patterns found, use last 50 lines of the log
      if (errorLines.length === 0) {
        const logLines = jobLogs.split(/\r?\n/).filter(Boolean);
        const fallbackLines = logLines.slice(-50);
        console.log(`[LLM-flow] Using fallback: last ${fallbackLines.length} lines`);
        errorLines = fallbackLines.map((line, i) => ({ lineNumber: logLines.length - fallbackLines.length + i + 1, line: line.replace(/^\d{4}-\d{2}-\d{2}T[^\s]+Z\s+/, '').trim() })).filter(l => l.line);
      }

      const result: GithubWorkflowRunErrors = { jobId, jobName, errorLines };

      if (errorLines.length > 0) {
        await this.env.WORKFLOW_RUN_LOGS.put(runErrorsKey, JSON.stringify(result), {
          expirationTtl: WEEK_TIME
        });
      }

      return result;
    } catch (error) {
      handleServiceError(error, 'Failed to fetch workflow run logs by run id');
      return null;
    }
  }

  public async triggerDeployWorkflowRun(inputs: GithubDeploymentWorkflowInputs) {
    try {
      const { owner, branch } = await this.getRepositoryConfig();

      const repoName = inputs.siteName;
      if (!repoName) throw new Error('Repository name is required');

      const targetWorkflow = await this.getDeploymentWorkflow(repoName);

      const targetWorkflowId = targetWorkflow?.id;
      if (!targetWorkflowId) throw new Error('Workflow not found');

      const defaultHeaders = await this.buildDefaultHeaders();

      await request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner,
        repo: repoName,
        workflow_id: targetWorkflowId,
        ref: branch,
        inputs,
        headers: { ...defaultHeaders }
      });

      // Poll with exponential backoff to ensure the workflow run is created
      let runId: number | undefined;
      const maxRetries = 5;
      let delay = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await sleep(delay);
        
        const runs = await request(
          'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs?per_page=1&branch={branch}&event=workflow_dispatch',
          {
            owner,
            repo: repoName,
            workflow_id: targetWorkflowId,
            branch,
            headers: { ...defaultHeaders }
          }
        );

        runId = runs.data.workflow_runs?.[0]?.id as unknown as number | undefined;
        if (runId) break;

        delay *= 2; // Exponential backoff
      }

      return { runId };
    } catch (error) {
      handleServiceError(error, 'Failed to dispatch GitHub workflow');
    }
  }

  public async getRepositories() {
    try {
      const { owner } = await this.getRepositoryConfig();
      const defaultHeaders = await this.buildDefaultHeaders();

      try {
        // Отримуємо ВСІ репозиторії (включаючи приватні), до яких має доступ токен
        const response = await request('GET /user/repos?sort=updated&per_page=100', {
          headers: { ...defaultHeaders }
        });
        
        // Фільтруємо їх за власником (якщо вказаний)
        return response.data.filter((item: any) => 
          item.owner.login.toLowerCase() === owner.toLowerCase()
        );
      } catch (e: any) {
        if (e.status === 404) {
          const orgResponse = await request('GET /orgs/{owner}/repos?sort=updated&per_page=100', {
            owner,
            headers: { ...defaultHeaders }
          });
          return orgResponse.data;
        }
        throw e;
      }
    } catch (error) {
      handleServiceError(error, 'Failed to fetch repositories');
      throw error;
    }
  }

  public async getRepositoryConfig() {
    const owner = await this.env.ASH_LIST_GITHUB_ORGANIZATION.get();
    const repo = await this.env.ASH_LIST_GITHUB_REPO.get();
    const branch = await this.env.ASH_LIST_GITHUB_BRANCH.get();

    if (!owner || !repo || !branch) {
      throw new Error('GitHub repository configuration is not configured.');
    }

    return { owner, repo, branch };
  }

  private async getGitHubToken() {
    const githubToken = await this.env.ASH_LIST_TASKS_GITHUB_TOKEN.get();
    if (!githubToken) throw new Error('GitHub token is not configured.');
    return githubToken;
  }

  private async getWorkflowFilename() {
    const workflowFilename = await this.env.ASH_LIST_WORKFLOW_FILENAME.get();
    if (!workflowFilename) throw new Error('Workflow filename is not configured.');
    return workflowFilename;
  }

  public async getWorkflowYamlContent(repoName: string) {
    try {
      const { owner } = await this.getRepositoryConfig();
      const workflowFilename = await this.getWorkflowFilename();
      const githubToken = await this.getGitHubToken();

      const response = await request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo: repoName,
        path: `.github/workflows/${workflowFilename}`,
        headers: {
          authorization: `token ${githubToken}`
        }
      });

      const data = response.data as any;
      if (data.content && data.encoding === 'base64') {
        // Decode base64 content
        return atob(data.content.replace(/\n/g, ''));
      }
      return null;
    } catch (error) {
      console.error('[GitHubService] Failed to fetch workflow YAML:', error);
      return null;
    }
  }

  private async buildDefaultHeaders(): Promise<HeadersInit> {
    const token = await this.getGitHubToken();
    return { authorization: `token ${token}` };
  }
}
