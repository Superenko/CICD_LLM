import type { SVGAttributes } from 'react';

import { cn } from '@/utils/misc';

const Circle = ({ className, ...props }: SVGAttributes<SVGElement>) => (
  <svg
    className={cn('size-1.5 fill-neutral-500', className)}
    viewBox="0 0 6 6"
    aria-hidden="true"
    {...props}
  >
    <circle cx="3" cy="3" r="3" />
  </svg>
);

export default Circle;
