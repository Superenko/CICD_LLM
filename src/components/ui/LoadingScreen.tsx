import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import Loading from '../icons/Loading';

const LoadingScreen = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex min-h-screen items-center justify-center', className)} {...props}>
    <Loading />
  </div>
);

export default LoadingScreen;
