import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import AddAppButton from '@/components/apps/AddNewAppButton';
import Header from '@/components/layout/header/Header';

import PageHeader from '../components/ui/PageHeader';

export const DefaultLayout = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Landing Pages');

  const showNewAppButton = location.pathname === '/';

  return (
    <>
      <Header />
      <main>
        {pageTitle && (
          <PageHeader>
            <h1 className="text-xl leading-tight font-semibold text-gray-800">{pageTitle}</h1>
            {showNewAppButton && <AddAppButton />}
          </PageHeader>
        )}

        <div className="container">
          <Outlet context={{ pageTitle, setPageTitle }} />
        </div>
      </main>
    </>
  );
};
