import type { NativeSelectProps } from './NativeSelect';

import AutocompleteSelect, { type AutocompleteProps } from './AutocompleteSelect';
import NativeSelect from './NativeSelect';

export const BASE_SELECT_STYLES =
  'min-w-0 flex-auto rounded-md border-0 bg-white p-2 text-gray-900 shadow-sm ring-1 ring-gray-300 outline-none ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6';

type SelectProps = NativeSelectProps & AutocompleteProps & { isAutocomplete?: boolean };

const Select = ({ isAutocomplete, ...props }: SelectProps) => {
  if (isAutocomplete) return <AutocompleteSelect {...props} />;
  return <NativeSelect {...props} />;
};

export default Select;
