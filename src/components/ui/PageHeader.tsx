import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

const PageHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white shadow', className)} {...props}>
    <div className="container py-6 sm:flex sm:items-center sm:justify-between">{children}</div>
  </div>
);

export default PageHeader;
