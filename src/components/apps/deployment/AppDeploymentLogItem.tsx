import type { HTMLAttributes } from 'react';

import type { AppLogItem } from '@/types/app';

import { cn } from '@/utils/misc';

interface AppDeploymentLogItemEntryProps extends HTMLAttributes<HTMLLIElement> {
  logItem: AppLogItem;
}

const AppDeploymentLogItem = ({ logItem, className, ...props }: AppDeploymentLogItemEntryProps) => (
  <li className={cn('relative flex gap-x-4', className)} {...props}>
    <div className="absolute top-0 -bottom-6 left-0 flex w-6 justify-center">
      <div className="w-px bg-gray-200"></div>
    </div>

    <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
      <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
    </div>

    <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">{logItem.data.message}</p>

    <time
      dateTime={logItem.data.timestamp}
      className="flex-none py-0.5 text-xs leading-5 text-gray-500"
    >
      {logItem.data.timestamp}
    </time>
  </li>
);

export default AppDeploymentLogItem;
