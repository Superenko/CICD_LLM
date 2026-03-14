import type { HTMLAttributes } from 'react';

import { Link } from 'react-router';

import type { AppStatus } from '@/types/app';
import type { Project } from '@/types/cloudflare';

import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/utils/misc';

interface AppDetailsProps extends HTMLAttributes<HTMLDivElement> {
  appName: Project['name'];
  appStatus: AppStatus;
  appPageUrls?: string[];
}

const AppDetails = ({ appName, appPageUrls, appStatus, className, ...props }: AppDetailsProps) => (
  <div className={cn('min-w-0 flex-auto', className)} {...props}>
    <p className="flex items-center gap-x-2 text-sm leading-6 font-semibold text-gray-900">
      <Link to={`/${appName}`}>{appName}</Link>
      {appName && <StatusBadge appName={appName} status={appStatus} />}
    </p>

    {appPageUrls?.length && (
      <ul className="mt-1 flex flex-col text-xs leading-5 text-gray-500">
        {appPageUrls.map((url) => (
          <li key={url}>
            <a href={url} target="_blank" className="relative truncate hover:underline">
              {url}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default AppDetails;
