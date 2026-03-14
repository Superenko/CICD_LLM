import type { HTMLAttributes } from 'react';

import type { GithubWorkflowJobStep, GithubWorkflowJobStepStatus } from '@/types/github';

import Loading from '@/components/icons/Loading';
import { cn } from '@/utils/misc';

import AppDeploymentLogNode from './AppDeploymentLogNode';

interface AppDeploymentLogsListProps extends HTMLAttributes<HTMLDivElement> {
  appLogs: GithubWorkflowJobStep[];
  status?: GithubWorkflowJobStepStatus;
}

const AppDeploymentLogsList = ({
  appLogs,
  status,
  className,
  ...props
}: AppDeploymentLogsListProps) => {
  const isQueued = status === 'queued';
  const isLoading = !appLogs.length && isQueued;

  return (
    <div className={cn('overflow-hidden rounded-md bg-white shadow', className)} {...props}>
      <div className="m-6 flow-root">
        {isLoading && <Loading className="mx-auto" />}

        {!isLoading && (
          <ul role="list" className="-mb-8">
            {appLogs.map((logNode) => (
              <AppDeploymentLogNode key={logNode.name} logNode={logNode} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AppDeploymentLogsList;
