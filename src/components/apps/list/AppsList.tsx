import { useMemo, type HTMLAttributes } from 'react';
import { useSearchParams } from 'react-router';

import { SEARCH_QUERY_PARAM } from '@/constants/misc';
import { useApps } from '@/hooks/useApps';
import { cn } from '@/utils/misc';

import AppsListItem from './AppsListItem';

const AppsList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const [searchParams] = useSearchParams();

  const {
    appsState: { appsData }
  } = useApps();

  const filteredApps = useMemo(() => {
    const searchValue = searchParams.get(SEARCH_QUERY_PARAM) || '';
    return appsData?.projects?.filter((app) =>
      app.name?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [appsData?.projects, searchParams]);

  const appsCount = filteredApps?.length ?? 0;

  return (
    <div className={cn('overflow-hidden rounded-md bg-white shadow', className)} {...props}>
      {!appsCount && (
        <div className="flex items-center justify-center px-4 py-5 text-gray-500 sm:px-6">
          <p>No apps found</p>
        </div>
      )}

      {!!appsCount && (
        <ul role="list" className="divide-y divide-gray-100">
          {filteredApps?.map((app) => (
            <AppsListItem key={app.id} appData={app} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppsList;
