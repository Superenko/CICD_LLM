import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

const AppDeploymentHeaderSkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('container grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8', className)}
    {...props}
  >
    <div className="flex max-w-xl items-center gap-2 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl lg:col-span-9">
      <div className="h-[42px] w-[106px] loading-skeleton" />
      <div className="h-[48px] w-[163px] loading-skeleton rounded-full" />
    </div>

    <div className="flex w-full max-w-md space-x-2 lg:col-span-3 lg:justify-end lg:pt-2">
      <div className="h-[40px] w-[86px] loading-skeleton" />
      <div className="h-[40px] w-[70px] loading-skeleton" />
    </div>
  </div>
);

export default AppDeploymentHeaderSkeleton;
