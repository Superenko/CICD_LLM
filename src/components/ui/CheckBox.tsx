import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

const CheckBox = ({ id, label, labelClassName, className, ...props }: CheckBoxProps) => (
  <label htmlFor={id} className={cn('flex items-center', className)}>
    <input
      id={id}
      type="checkbox"
      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
      {...props}
    />
    <span className={cn('ms-2 text-sm text-gray-600', labelClassName)}>{label}</span>
  </label>
);

export default CheckBox;
