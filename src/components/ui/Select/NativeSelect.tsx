import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import { BASE_SELECT_STYLES } from '.';

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const NativeSelect = ({ className, children, ...props }: NativeSelectProps) => (
  <select className={cn(BASE_SELECT_STYLES, className)} {...props}>
    {children}
  </select>
);

export default NativeSelect;
