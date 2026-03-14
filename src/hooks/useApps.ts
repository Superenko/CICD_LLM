import { useContext } from 'react';

import { AppsContext } from '@/contexts/apps/apps';

export const useApps = () => {
  const context = useContext(AppsContext);
  if (context === undefined) {
    throw new Error('useApps must be used within an AppsProvider');
  }
  return context;
};
