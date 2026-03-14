import { cn } from '@/utils/misc';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

const Label = ({ required, optional, className, children, ...props }: LabelProps) => (
  <label className={cn('block text-sm font-medium text-gray-700', className)} {...props}>
    {children}
    {required && <span className="ml-1 inline-block text-lg text-red-600">*</span>}
    {optional && <span className="ml-1 inline-block text-xs text-gray-500">(optional)</span>}
  </label>
);

export default Label;
