import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import AppLogo from '../icons/AppLogo';

const AuthCard = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0',
      className
    )}
    {...props}
  >
    <AppLogo />

    <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
      {children}
    </div>
  </div>
);

export default AuthCard;
