import { Link, type LinkProps } from 'react-router';

import { cn } from '@/utils/misc';

interface NavLinkProps extends LinkProps {
  isActive?: boolean;
  isMobile?: boolean;
}

const NavLink = ({ isActive, isMobile, className, ...props }: NavLinkProps) => {
  const isRegularLinkActive = !isMobile && isActive;
  const isMobileLinkActive = isMobile && isActive;
  return (
    <Link
      className={cn(
        !isMobile &&
          'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm leading-5 font-medium text-gray-500 transition duration-150 ease-in-out hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 focus:outline-none',
        isRegularLinkActive && 'border-indigo-400 text-gray-900 focus:border-indigo-700',

        isMobile &&
          'block w-full border-l-4 border-transparent py-2 ps-3 pe-4 text-start text-base font-medium text-gray-600 transition duration-150 ease-in-out hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none',
        isMobileLinkActive &&
          'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800',
        className
      )}
      {...props}
    />
  );
};

export default NavLink;
