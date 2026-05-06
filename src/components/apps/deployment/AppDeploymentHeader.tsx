import { useCallback, type HTMLAttributes } from 'react';

import type { AppDeployment } from '@/types/app';
import type { GithubWorkflowJobStepConclusion, GithubWorkflowJobStepStatus } from '@/types/github';

import Loading from '@/components/icons/Loading';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { useApps } from '@/hooks/useApps';
import { cn } from '@/utils/misc';

interface AppDeploymentHeaderProps extends HTMLAttributes<HTMLDivElement> {
  appName: AppDeployment['project_name'];
  status?: GithubWorkflowJobStepStatus | null;
  conclusion?: GithubWorkflowJobStepConclusion | null;
  deploymentError?: AppDeployment['errorSummary'];
  version?: number;
  isDeploying: boolean;
}

type ErrorSummaryObject = {
  category: string;
  severity?: string;
  root_cause?: string;
  solution: string;
  actionable_commands?: string[];
};

const SEVERITY_STYLES: Record<string, string> = {
  Low: 'bg-gray-200 text-gray-700',
  Medium: 'bg-yellow-400 text-yellow-900',
  High: 'bg-orange-500 text-white',
  Critical: 'bg-red-600 text-white'
};

const SeverityBadge = ({ severity }: { severity?: string }) => {
  if (!severity) return null;
  const style = SEVERITY_STYLES[severity] ?? 'bg-gray-200 text-gray-700';
  return (
    <span className={cn('inline-block text-xs font-bold px-2.5 py-0.5 rounded', style)}>
      {severity}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: string }) => (
  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
    {category}
  </span>
);

const ErrorCard = ({ error }: { error: ErrorSummaryObject }) => (
  <div className="bg-red-50 border border-red-100 rounded-lg p-5 space-y-4 text-sm">
    <div className="flex items-center gap-2 flex-wrap">
      <CategoryBadge category={error.category} />
      <SeverityBadge severity={error.severity} />
    </div>

    {error.root_cause && (
      <div>
        <p className="font-semibold text-gray-800 mb-1">
          <span className="mr-1">🔍</span> Root Cause:
        </p>
        <p className="text-red-700 leading-relaxed">{error.root_cause}</p>
      </div>
    )}

    <div>
      <p className="font-semibold text-gray-800 mb-1">
        <span className="mr-1">💡</span> Solution:
      </p>
      <p className="text-red-600 leading-relaxed">{error.solution}</p>
    </div>

    {error.actionable_commands && error.actionable_commands.length > 0 && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">
          <span className="mr-1">🔧</span> Actionable Commands:
        </p>
        <div className="bg-gray-900 rounded-md px-4 py-3 space-y-1 font-mono text-xs text-green-300 overflow-x-auto">
          {error.actionable_commands.map((cmd, i) => (
            <div key={i} className="whitespace-nowrap">
              <span className="text-gray-500 select-none mr-2">$</span>
              {cmd}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const AppDeploymentHeader = ({
  appName,
  status,
  conclusion,
  deploymentError,
  version,
  isDeploying,
  className,
  ...props
}: AppDeploymentHeaderProps) => {
  const {
    appDeploymentTriggerState: { requestedAppDeployments },
    deployApp
  } = useApps();

  const isDeployButtonDisabled = !!appName && requestedAppDeployments.includes(appName);

  const handleDeploy = useCallback(async () => {
    if (!appName) return;
    const runId = await deployApp(appName);
    if (Number.isInteger(runId)) {
      window.location.reload();
    }
  }, [appName, deployApp]);

  const isErrorObject =
    !!deploymentError && typeof deploymentError === 'object' && deploymentError !== null;

  return (
    <div className={cn('container flex flex-col gap-6', className)} {...props}>
      {/* Top bar: Status + Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {status && (
          <h2 className="inline text-3xl font-medium tracking-tight text-gray-900">
            Status: <StatusBadge status={status} conclusion={conclusion} size="lg" />
          </h2>
        )}

        {!isDeploying && (
          <div className="flex items-center gap-2">
            {version && (
              <Button variant="outline" disabled>
                Version {version}
              </Button>
            )}
            <Button
              onClick={handleDeploy}
              confirmMessage="Are you sure you want to deploy this?"
              disabled={isDeployButtonDisabled}
              icon={isDeployButtonDisabled ? <Loading className="size-5 text-white" /> : null}
            >
              Deploy
            </Button>
          </div>
        )}
      </div>

      {/* Error card */}
      {deploymentError && (
        <div>
          {isErrorObject ? (
            <ErrorCard error={deploymentError as ErrorSummaryObject} />
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-red-600 text-sm">{deploymentError as string}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppDeploymentHeader;
