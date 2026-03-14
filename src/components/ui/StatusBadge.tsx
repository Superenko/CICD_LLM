import { useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';

import type { AppStatus } from '@/types/app';
import type { Project } from '@/types/cloudflare';
import type { GithubWorkflowJobStepConclusion, GithubWorkflowJobStepStatus } from '@/types/github';

import Circle from '@/components/icons/Circle';
import { cn } from '@/utils/misc';

interface BadgeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  status: AppStatus | GithubWorkflowJobStepStatus;
  conclusion?: GithubWorkflowJobStepConclusion | null;
  appName?: Project['name'];
  size?: 'sm' | 'lg';
}

const StatusBadge = ({
  status,
  conclusion,
  appName,
  size = 'sm',
  className,
  ...props
}: BadgeProps) => {
  const isSuccess = (status === 'completed' && conclusion === 'success') || status === 'success';
  const isFailure = (status === 'completed' && conclusion === 'failure') || status === 'failure';
  const isUnknown = !isSuccess && !isFailure;

  const isLarge = size === 'lg';

  const formattedStatus = useMemo(() => {
    if (!status) return 'Not deployed';

    switch (status) {
      case 'queued':
      case 'in_progress':
      case 'waiting':
      case 'pending':
        return 'Deploying';
      case 'completed': {
        if (!conclusion) return 'Unknown';
        const capitalizedConclusion = conclusion.charAt(0).toUpperCase() + conclusion.slice(1);
        return capitalizedConclusion;
      }
      default: {
        const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return capitalizedStatus;
      }
    }
  }, [status, conclusion]);

  const Wrapper = useMemo(() => {
    const classes = cn('inline-flex', className);

    if (appName) {
      return ({ children }: { children: ReactNode }) => (
        <Link to={`/${appName}`} className={classes} {...props}>
          {children}
        </Link>
      );
    }

    return ({ children }: { children: ReactNode }) => (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }, [appName, className, props]);

  return (
    <Wrapper>
      <span
        className={cn(
          'inline-flex items-center gap-x-1.5 rounded-md font-medium',
          isLarge && 'rounded-full px-5 py-1 text-3xl tracking-tight sm:text-4xl',
          !isLarge && 'px-1.5 py-0.5 text-xs',
          isFailure && 'bg-red-100 text-red-700',
          isSuccess && 'bg-green-100 text-green-700',
          isUnknown && 'bg-gray-500 text-gray-100'
        )}
      >
        {!isLarge && (
          <Circle
            className={cn(
              isFailure && 'fill-red-500',
              isSuccess && 'fill-green-500',
              isUnknown && 'fill-gray-100'
            )}
          />
        )}

        {formattedStatus}
      </span>
    </Wrapper>
  );
};

export default StatusBadge;
