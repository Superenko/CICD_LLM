import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import NavigationLinks from './NavigationLinks';

interface ResponsiveMenuProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

const ResponsiveMenu = ({ isOpen, className, ...props }: ResponsiveMenuProps) => (
  <div className={cn('sm:hidden', isOpen ? 'block' : 'hidden', className)} {...props}>
    <NavigationLinks className="space-y-1 pt-2 pb-3" isMobile />
  </div>
);

export default ResponsiveMenu;
