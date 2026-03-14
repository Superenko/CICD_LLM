import { extractModelName } from '@shared/utils';
import { useMemo } from 'hono/jsx';
import { memo, type HTMLAttributes } from 'react';

import { getTimeAgo } from '@/utils/datetime';
import { cn } from '@/utils/misc';

interface AppMetaInfoProps extends HTMLAttributes<HTMLDivElement> {
  appName?: string;
  lastDeployed?: string | null;
}

const AppMetaInfo = ({ appName, lastDeployed, className, ...props }: AppMetaInfoProps) => {
  const modelName = extractModelName(appName);

  const latestDeploymentTime = useMemo(
    () => (lastDeployed ? getTimeAgo(lastDeployed) : null),
    [lastDeployed]
  );

  return (
    <div className={cn('hidden sm:flex sm:flex-col sm:items-end', className)} {...props}>
      <p className="mt-1 text-xs leading-5 text-gray-500">{modelName}</p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {lastDeployed ? (
          <>
            Last deployed <time dateTime={lastDeployed}>{latestDeploymentTime}</time>
          </>
        ) : (
          'No deployments yet'
        )}
      </p>
    </div>
  );
};

export default memo(AppMetaInfo);
