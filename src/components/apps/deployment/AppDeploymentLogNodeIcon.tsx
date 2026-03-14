import type { HTMLAttributes } from 'react';

import type { GithubWorkflowJobStep } from '@/types/github';

import Loading from '@/components/icons/Loading';
import UserCircle from '@/components/icons/UserCircle';
import { cn } from '@/utils/misc';

interface AppDeploymentLogNodeIconProps extends HTMLAttributes<HTMLDivElement> {
  status: GithubWorkflowJobStep['status'];
  conclusion: GithubWorkflowJobStep['conclusion'];
}

const AppDeploymentLogNodeIcon = ({
  status,
  conclusion,
  className,
  ...props
}: AppDeploymentLogNodeIconProps) => {
  const isSuccess = status === 'completed' && conclusion === 'success';
  const isFailure = status === 'completed' && conclusion === 'failure';

  const isNeutral =
    status === 'pending' ||
    status === 'waiting' ||
    status === 'queued' ||
    status === 'requested' ||
    (status === 'completed' &&
      (conclusion === 'cancelled' || conclusion === 'neutral' || conclusion === 'skipped'));

  const isInProgress = status === 'in_progress';

  return (
    <div
      className={cn(
        'flex size-8 items-center justify-center rounded-full ring-8 ring-white',
        isSuccess && 'bg-green-100 text-green-700',
        isFailure && 'bg-red-100 text-red-700',
        (isNeutral || isInProgress) && 'bg-gray-100 text-gray-500',
        className
      )}
      {...props}
    >
      {!isInProgress && <UserCircle />}
      {isInProgress && <Loading className="size-4" />}
    </div>
  );
};

export default AppDeploymentLogNodeIcon;
