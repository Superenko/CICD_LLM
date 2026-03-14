import type { HTMLAttributes } from 'react';

const AppDeploymentLogNodeSkeleton = (props: HTMLAttributes<HTMLLIElement>) => (
  <li {...props}>
    <div className="relative pb-8">
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className="relative px-1">
            <div className="size-8 loading-skeleton rounded-full" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mt-1.5 flex items-center justify-between gap-x-4 text-sm">
            <div className="h-[20px] w-[112px] loading-skeleton" />
            <div className="h-[20px] w-[138px] loading-skeleton" />
          </div>
        </div>
      </div>
    </div>
  </li>
);

export default AppDeploymentLogNodeSkeleton;
