import type { HTMLAttributes } from 'react';

import Loading from '@/components/icons/Loading';
import { MAX_SELECTED_VALUES } from '@/constants/misc';
import { cn } from '@/utils/misc';

import type { NativeSelectProps } from './NativeSelect';

import { BASE_SELECT_STYLES } from '.';
import { useAutocompleteSelect } from '../../../hooks/useAutocompleteSelect';

type SelectOption = {
  value: string;
  label: string;
};

export interface AutocompleteProps {
  options?: Array<SelectOption | string>;
  onValueChange?: (value: string) => void;
  selectedValues?: string[];
  onSelectedValuesChange?: (values: string[]) => void;
  dropdownProps?: HTMLAttributes<HTMLUListElement>;
  placeholder?: string;
  isLoading?: boolean;
  isMultiSelect?: boolean;
  maxValues?: number;
}

type AutocompleteSelectProps = NativeSelectProps & AutocompleteProps;

const AutocompleteSelect = ({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  selectedValues,
  onSelectedValuesChange,
  placeholder,
  dropdownProps,
  isLoading,
  isMultiSelect = false,
  className,
  children
}: AutocompleteSelectProps) => {
  const {
    refs: { containerRef, listRef },
    state: { isOpen, setIsOpen, inputValue, setInputValue, highlightedIndex, setHighlightedIndex },
    data: { filteredOptions, selectedValue },
    handlers: { onKeyDown, closeWithDelay, handleSelect }
  } = useAutocompleteSelect({
    children,
    options,
    value,
    defaultValue,
    selectedValues,
    onSelectedValuesChange,
    isMultiSelect,
    onChange,
    onValueChange
  });

  return (
    <div
      ref={containerRef}
      className={cn('relative', isMultiSelect && BASE_SELECT_STYLES, className)}
    >
      {isMultiSelect && !!selectedValues?.length && (
        <ul className="flex flex-wrap gap-0.5">
          {selectedValues?.map((value) => (
            <li
              key={value}
              className="w-fit cursor-pointer rounded-full border bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500"
              onClick={() => handleSelect({ value, label: value })}
            >
              {value}

              <span
                className={cn(
                  'bg-white-600 ml-1.5 rounded-full bg-white px-1 py-px text-indigo-600 backdrop-blur-sm'
                )}
              >
                ✕
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        id={id}
        className={cn(
          'w-full',
          isMultiSelect && 'mt-1.5 border-none p-0 px-1 text-sm outline-none focus:ring-0',
          isMultiSelect && !selectedValues?.length && 'mt-0',
          !isMultiSelect && BASE_SELECT_STYLES
        )}
        name={name}
        value={inputValue}
        onChange={(e) => {
          setIsOpen(true);
          setInputValue(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={closeWithDelay}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute left-0 z-10 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg ring-1 ring-gray-300 focus:outline-none',
            isMultiSelect ? 'mt-4' : 'mt-2',
            dropdownProps?.className
          )}
          {...dropdownProps}
        >
          {isLoading && (
            <li className="px-3 py-2 text-gray-500">
              <Loading className="mx-auto size-7" />
            </li>
          )}

          {!isLoading && !filteredOptions.length && (
            <li className="px-3 py-2 text-gray-500">No results</li>
          )}

          {filteredOptions.length > 0 &&
            filteredOptions.map((option, idx) => {
              const { value, label } = option;
              const isActive = idx === highlightedIndex;
              const isSelected =
                String(selectedValue ?? '') === value || selectedValues?.includes(value);

              const canSelect =
                isMultiSelect && selectedValues
                  ? selectedValues?.length < MAX_SELECTED_VALUES
                  : true;

              return (
                <li
                  key={`${value}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'cursor-pointer px-3 py-2',
                    !canSelect && 'cursor-not-allowed',
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900',
                    isSelected && !isActive ? 'bg-gray-50' : ''
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => canSelect && handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {label}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSelect;
