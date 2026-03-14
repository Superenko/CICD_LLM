import type { Project } from '@shared/types/projects';

import { useCallback, useMemo, type HTMLAttributes } from 'react';
import { toast } from 'react-toastify';

import type { AppStatus } from '@/types/app';
import type { GithubWorkflowJobStepStatus } from '@/types/github';

import AppAvatar from '@/components/apps/AppAvatar';
import AppDetails from '@/components/apps/AppDetails';
import AppMetaInfo from '@/components/apps/AppMetaInfo';
import CheckCircle from '@/components/icons/CheckCircle';
import Loading from '@/components/icons/Loading';
import Button from '@/components/ui/Button';
import { useApps } from '@/hooks/useApps';
import { checkIfDeploying, cn } from '@/utils/misc';

interface AppsListItemProps extends HTMLAttributes<HTMLLIElement> {
  appData: Project;
}

const AppsListItem = ({ className, appData, ...props }: AppsListItemProps) => {
  const {
    deployApp,
    appDeploymentTriggerState: { requestedAppDeployments, appDeploymentRequestError }
  } = useApps();

  const { name: appName, latest_deployment_status, latest_deployment_at, domains } = appData;

  const status = (latest_deployment_status as unknown as AppStatus) ?? undefined;

  const lastDeployed = latest_deployment_at
    ? new Date(latest_deployment_at * 1000).toISOString()
    : undefined;

  const pageUrls = useMemo(() => {
    if (!domains) return undefined;

    const domainsArray = typeof domains === 'string' ? domains.split(',') : domains;

    return domainsArray
      .map((domain: string) => domain.trim())
      .filter(Boolean)
      .map((domain: string) => `https://${domain}`);
  }, [domains]);

  const isDeploying = useMemo(
    () => (status ? checkIfDeploying(status as GithubWorkflowJobStepStatus) : false),
    [status]
  );

  const isDeployButtonDisabled = useMemo(
    () => isDeploying || (!!appName && requestedAppDeployments.includes(appName)),
    [appName, isDeploying, requestedAppDeployments]
  );

  const handleDeployClick = useCallback(async () => {
    if (!appName) return;

    const runId = await deployApp(appName);

    if (Number.isInteger(runId)) {
      toast.success(`${appName} app deployment started!`);
    } else if (appDeploymentRequestError) {
      toast.error(`Failed to start the ${appName} app deployment: ${appDeploymentRequestError}`);
    }
  }, [appDeploymentRequestError, appName, deployApp]);

  return (
    <li
      className={cn(
        'relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6',
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-x-4">
        <AppAvatar appName={appName} />
        <AppDetails appName={appName} appStatus={status} appPageUrls={pageUrls} />
      </div>

      <div className="flex shrink-0 items-center gap-x-4">
        <AppMetaInfo appName={appName} lastDeployed={lastDeployed} />

        {!isDeploying && (
          <Button
            onClick={handleDeployClick}
            confirmMessage="Are you sure you want to deploy this?"
            icon={
              isDeployButtonDisabled ? (
                <Loading className="-mr-0.5 size-5 text-white" />
              ) : (
                <CheckCircle className="-mr-0.5" />
              )
            }
            disabled={isDeployButtonDisabled}
          >
            Deploy
          </Button>
        )}
      </div>
    </li>
  );
};

export default AppsListItem;
