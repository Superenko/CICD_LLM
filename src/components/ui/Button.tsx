import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { cn } from '@/utils/misc';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'dark';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  confirmMessage?: string;
}

const Button = ({
  variant = 'primary',
  icon,
  iconPosition = 'right',
  confirmMessage,
  className,
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onClick?.(e);
      }
    } else {
      onClick?.(e);
    }
  };

  return (
    <button
      className={cn(
        'flex items-center rounded-md py-2 font-semibold text-white',
        !disabled && 'cursor-pointer',
        variant === 'primary' &&
          'gap-x-1.5 bg-indigo-600 px-3 text-sm shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        variant === 'outline' &&
          'gap-x-1.5 border border-indigo-600 px-3 text-sm text-indigo-600 shadow-sm hover:bg-indigo-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        variant === 'dark' &&
          'border border-transparent bg-gray-800 px-4 text-xs tracking-widest uppercase transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none active:bg-gray-900',
        disabled && 'pointer-events-none',
        disabled &&
          (variant === 'primary'
            ? 'bg-indigo-500'
            : variant === 'outline'
              ? 'bg-indigo-50'
              : 'bg-gray-700'),
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </button>
  );
};

export default Button;
