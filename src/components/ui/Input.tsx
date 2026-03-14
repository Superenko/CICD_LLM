import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'min-w-0 flex-auto rounded-md border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 outline-none ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6',
      className
    )}
    {...props}
  />
);

export default Input;
