import { type ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  containerClassName?: string;
}

const MenuButton = ({ isActive, containerClassName, className, ...props }: MenuButtonProps) => (
  <div className={cn('-me-2 flex items-center', containerClassName)}>
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none',
        className
      )}
      {...props}
    >
      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path
          className={cn(isActive ? 'hidden' : 'inline-flex')}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          className={cn(isActive ? 'inline-flex' : 'hidden')}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

export default MenuButton;
