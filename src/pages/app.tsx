import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useOutletContext, useParams } from 'react-router';

import AppDeploymentHeader from '@/components/apps/deployment/AppDeploymentHeader';
import AppDeploymentLogsList from '@/components/apps/deployment/AppDeploymentLogsList';
import AppDeploymentHeaderSkeleton from '@/components/apps/deployment/skeletons/AppDeploymentHeaderSkeleton';
import AppDeploymentLogsListSkeleton from '@/components/apps/deployment/skeletons/AppDeploymentLogsListSkeleton';
import { useApps } from '@/hooks/useApps';
import { checkIfDeploying } from '@/utils/misc';

export const App = () => {
  const { name } = useParams();
  const { setPageTitle } = useOutletContext<{ setPageTitle: Dispatch<SetStateAction<string>> }>();

  const {
    appDeploymentState: { appDeployment, isAppDeploymentLoading, appDeploymentError },
    appDeploymentTriggerState: { appDeploymentRequestError },
    fetchLatestAppDeployment
  } = useApps();

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const appDeploymentLogs = appDeployment?.logs;
  const appDeploymentStatus = appDeployment?.status;

  const isDeploying = useMemo(
    () => (appDeploymentStatus ? checkIfDeploying(appDeploymentStatus) : false),
    [appDeploymentStatus]
  );

  const showSkeleton = !isInitialLoadComplete && isAppDeploymentLoading && !appDeploymentError;
  const showContent =
    !!appDeployment && !appDeploymentError && (name ? appDeployment.project_name === name : true);

  useEffect(() => {
    if (appDeployment) {
      setPageTitle(`Landing page: ${appDeployment.project_name ?? name} (Cloudflare)`);
    }
  }, [appDeployment, name, setPageTitle]);

  useEffect(() => {
    if (!name) return;
    fetchLatestAppDeployment(name);
  }, [fetchLatestAppDeployment, name]);

  useEffect(() => {
    if (!name) return;
    if (!isDeploying) return;

    const intervalId = setInterval(() => {
      fetchLatestAppDeployment(name);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [fetchLatestAppDeployment, isDeploying, name]);

  useEffect(() => {
    if (!isAppDeploymentLoading) {
      setIsInitialLoadComplete(true);
    }
  }, [isAppDeploymentLoading]);

  useEffect(() => {
    setIsInitialLoadComplete(false);
  }, [name]);

  return (
    <>
      {appDeploymentError && (
        <div className="pt-6">
          <p className="text-red-600">{appDeploymentError}</p>
        </div>
      )}

      {showSkeleton && (
        <>
          <div className="pt-6">
            <AppDeploymentHeaderSkeleton />
          </div>

          <div className="py-6">
            <AppDeploymentLogsListSkeleton />
          </div>
        </>
      )}

      {showContent && (
        <>
          <div className="pt-6">
            <AppDeploymentHeader
              appName={appDeployment.project_name}
              status={appDeploymentStatus}
              conclusion={appDeployment.conclusion}
              deploymentError={appDeployment.errorSummary}
              version={appDeployment.version}
              isDeploying={isDeploying}
            />

            {appDeploymentRequestError && (
              <p className="mt-6 text-red-600">{appDeploymentRequestError}</p>
            )}
          </div>

          {appDeploymentLogs && (
            <div className="py-6">
              <AppDeploymentLogsList appLogs={appDeploymentLogs} status={appDeploymentStatus} />
            </div>
          )}
        </>
      )}
    </>
  );
};
