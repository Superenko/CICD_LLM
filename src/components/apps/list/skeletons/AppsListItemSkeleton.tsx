import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

const AppsListItemSkeleton = ({ className, ...props }: HTMLAttributes<HTMLLIElement>) => (
  <li
    className={cn(
      'relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6',
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 gap-x-4">
      <div className="flex size-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-gray-300" />

      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-2 text-sm leading-6 font-semibold text-gray-900">
          <div className="h-5 w-[120px] loading-skeleton" />
          <div className="h-5 w-[67px] loading-skeleton" />
        </div>

        <div className="mt-1 h-4 w-36 loading-skeleton" />
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-x-4">
      <div className="hidden sm:flex sm:flex-col sm:items-end">
        <div className="mt-1 h-4 w-24 loading-skeleton" />
        <div className="mt-1 h-4 w-36 loading-skeleton" />
      </div>

      <div className="h-9 w-24 loading-skeleton" />
    </div>
  </li>
);

export default AppsListItemSkeleton;
