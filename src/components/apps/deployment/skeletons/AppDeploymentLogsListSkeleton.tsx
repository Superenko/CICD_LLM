import type { HTMLAttributes } from 'react';

import AppDeploymentLogNodeSkeleton from '@/components/apps/deployment/skeletons/AppDeploymentLogNodeSkeleton';
import { cn } from '@/utils/misc';

const AppDeploymentLogsListSkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('overflow-hidden rounded-md bg-white shadow', className)} {...props}>
    <div className="m-6 flow-root">
      <ul role="list" className="-mb-8">
        {Array.from({ length: 10 }).map((_, index) => (
          <AppDeploymentLogNodeSkeleton key={index} />
        ))}
      </ul>
    </div>
  </div>
);

export default AppDeploymentLogsListSkeleton;
