import { useState, type HTMLAttributes } from 'react';
import { Link } from 'react-router';

import AppLogo from '@/components/icons/AppLogo';

import LogOutButton from '../../auth/LogOutButton';
import MenuButton from './MenuButton';
import NavigationLinks from './NavigationLinks';
import ResponsiveMenu from './ResponsiveMenu';

const Header = (props: HTMLAttributes<HTMLDivElement>) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header {...props}>
      <nav className="border-b border-gray-100 bg-white">
        <div className="container flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link to="/">
                <AppLogo className="size-9" />
              </Link>
            </div>

            <NavigationLinks className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex" />
          </div>

          <div className="hidden sm:ms-6 sm:flex sm:items-center">
            <div className="relative ms-3">
              <LogOutButton />
            </div>
          </div>

          <MenuButton
            containerClassName="sm:hidden"
            isActive={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        </div>

        <ResponsiveMenu isOpen={isMobileMenuOpen} />
      </nav>
    </header>
  );
};

export default Header;
