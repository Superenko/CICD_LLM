import { useState } from 'react';
import { useApps } from '@/hooks/useApps';
import Loading from '../icons/Loading';
import Button, { type ButtonProps } from '../ui/Button';

const SyncAppsButton = (props: ButtonProps) => {
  const { fetchApps } = useApps();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    fetch('/api/projects/sync', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        fetchApps(1, false);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      icon={isSyncing ? <Loading className="size-5 text-white" /> : null}
      {...props}
    >
      Sync
    </Button>
  );
};

export default SyncAppsButton;
