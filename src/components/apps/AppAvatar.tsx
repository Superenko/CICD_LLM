import { useMemo, type HTMLAttributes } from 'react';

import type { Project } from '@/types/cloudflare';

import { cn, getStringColors } from '@/utils/misc';

const DEFAULT_AVATAR_COLORS = {
  bgColor: '#737373',
  textColor: '#FFFFFF'
};

interface AppAvatarProps extends HTMLAttributes<HTMLDivElement> {
  appName: Project['name'];
}

const AppAvatar = ({ appName, className, ...props }: AppAvatarProps) => {
  const avatarColors = useMemo(
    () => (appName ? getStringColors(appName) : DEFAULT_AVATAR_COLORS),
    [appName]
  );

  return (
    <div
      className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', className)}
      style={{
        backgroundColor: avatarColors.bgColor
      }}
      {...props}
    >
      <span className="text-xl font-bold uppercase" style={{ color: avatarColors.textColor }}>
        {appName?.substring(0, 2)}
      </span>
    </div>
  );
};

export default AppAvatar;
