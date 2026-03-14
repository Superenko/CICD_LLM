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
  deploymentError?: string | null;
  version?: number;
  isDeploying: boolean;
}

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

  return (
    <div className={cn('container flex flex-col gap-8 lg:gap-6', className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-8 lg:gap-6">
        {status && (
          <div className="max-w-xl lg:col-span-9">
            <h2 className="inline text-3xl font-medium tracking-tight text-gray-900 sm:block sm:text-4xl lg:inline xl:block">
              Status: <StatusBadge status={status} conclusion={conclusion} size="lg" />
            </h2>
          </div>
        )}

        {!isDeploying && (
          <div className="flex space-x-2 lg:pt-2">
            {version && (
              <Button className="mx-2 flex" disabled>
                Version {version}
              </Button>
            )}

            <Button
              className="flex"
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

      {deploymentError && (
        <div className="text-sm font-medium tracking-tight">
          <p className="text-red-600">{deploymentError}</p>
        </div>
      )}
    </div>
  );
};

export default AppDeploymentHeader;
