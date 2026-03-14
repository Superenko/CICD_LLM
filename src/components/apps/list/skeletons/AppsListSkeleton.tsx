import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import AppsListItemSkeleton from './AppsListItemSkeleton';

const AppsListSkeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('overflow-hidden rounded-md bg-white shadow', className)} {...props}>
    <ul role="list" className="divide-y divide-gray-100">
      {Array.from({ length: 10 }).map((_, index) => (
        <AppsListItemSkeleton key={index} />
      ))}
    </ul>
  </div>
);

export default AppsListSkeleton;
