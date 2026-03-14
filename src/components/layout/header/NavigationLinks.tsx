import type { HTMLAttributes } from 'react';

import { useLocation, type To } from 'react-router';

import NavLink from '@/components/ui/NavLink';
import { NAV_LINKS } from '@/constants/misc';

interface NavigationLinksProps extends HTMLAttributes<HTMLDivElement> {
  isMobile?: boolean;
}

const NavigationLinks = ({ isMobile, ...props }: NavigationLinksProps) => {
  const location = useLocation();

  const isNavLinkActive = (path: To) => location.pathname === path;

  return (
    <div {...props}>
      {NAV_LINKS.map(({ label, to }) => (
        <NavLink key={label} to={to} isActive={isNavLinkActive(to)} isMobile={isMobile}>
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default NavigationLinks;
