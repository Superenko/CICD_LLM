import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';

import AppsList from '@/components/apps/list/AppsList';
import AppsListSkeleton from '@/components/apps/list/skeletons/AppsListSkeleton';
import Loading from '@/components/icons/Loading';
import SearchBox from '@/components/search/SearchBox';
import Button from '@/components/ui/Button';
import { useApps } from '@/hooks/useApps';

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);

  const isInitialLoad = useRef(true);

  const { setPageTitle } = useOutletContext<{ setPageTitle: Dispatch<SetStateAction<string>> }>();

  const {
    fetchApps,
    appsState: { appsData, isAppsLoading, isLoadingMore, appsError }
  } = useApps();

  const { metadata: appsMetadata } = appsData ?? {};
  const { total_pages = 1 } = appsMetadata ?? {};

  const isLoadMoreButtonVisible = page < total_pages;

  const handleLoadMore = useCallback(() => {
    fetchApps(page + 1, true);

    setSearchParams((prev) => {
      prev.set('page', String(page + 1));
      return prev;
    });
  }, [fetchApps, page, setSearchParams]);

  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);

  useEffect(() => {
    if (isInitialLoad.current) {
      setSearchParams((prev) => {
        prev.delete('page');
        return prev;
      });

      fetchApps();

      isInitialLoad.current = false;
    }
  }, [fetchApps, setSearchParams]);

  return (
    <>
      <div className="pt-6">
        <SearchBox />
      </div>

      <div className="py-6">
        {appsError && <p className="text-red-600">{appsError}</p>}
        {isAppsLoading && !appsError && <AppsListSkeleton />}
        {!isAppsLoading && !appsError && <AppsList />}
      </div>

      <div className="pb-6">
        <Button
          className="mx-auto"
          onClick={handleLoadMore}
          disabled={isLoadingMore || !isLoadMoreButtonVisible}
          icon={isLoadingMore ? <Loading className="size-5 text-indigo-600" /> : undefined}
          variant="outline"
        >
          Load More
        </Button>
      </div>
    </>
  );
};
