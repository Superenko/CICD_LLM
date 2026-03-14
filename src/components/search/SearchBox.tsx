import { type HTMLAttributes } from 'react';

import { cn } from '@/utils/misc';

import SearchInput from './SearchInput';

const SearchBox = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8', className)} {...props}>
    <div className="max-w-xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:col-span-8">
      <h2 className="inline sm:block lg:inline xl:block">Landing page sites</h2>
    </div>

    <SearchInput
      containerClassName="lg:col-span-4"
      id="site-name"
      label="Landing page name"
      placeholder="Search landing page..."
    />
  </div>
);

export default SearchBox;
