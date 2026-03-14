import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode
} from 'react';

import type { AutocompleteProps } from '../components/ui/Select/AutocompleteSelect';
import type { NativeSelectProps } from '../components/ui/Select/NativeSelect';

export type SelectOption = {
  value: string;
  label: string;
};

export type UseAutocompleteSelectArgs = Pick<
  NativeSelectProps,
  'children' | 'value' | 'defaultValue' | 'onChange' | 'name' | 'required'
> &
  AutocompleteProps;

export const useAutocompleteSelect = ({
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  selectedValues,
  onSelectedValuesChange,
  isMultiSelect = false,
  children
}: UseAutocompleteSelectArgs) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const parsedOptions: SelectOption[] = useMemo(() => {
    let formattedOptions: SelectOption[] = [];

    if (options?.length) {
      formattedOptions = options.map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : { value: String(option.value), label: option.label ?? String(option.value) }
      );

      return formattedOptions;
    }

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const childElement = child as ReactElement<{ value?: unknown; children?: ReactNode }>;

      if (typeof childElement.type === 'string' && childElement.type === 'option') {
        const optionValue = childElement.props.value ?? childElement.props.children;
        const optionLabel = childElement.props.children;

        const labelText = Array.isArray(optionLabel)
          ? String((optionLabel as Array<unknown>).join(''))
          : String((optionLabel as ReactNode) ?? optionValue ?? '');

        formattedOptions.push({ value: String(optionValue ?? labelText), label: labelText });
      }
    });

    return formattedOptions;
  }, [children, options]);

  const selectedValue = value ?? defaultValue ?? '';

  const selectedOption = useMemo(
    () => parsedOptions.find((option) => option.value === String(selectedValue)),
    [parsedOptions, selectedValue]
  );

  const filteredOptions = useMemo(() => {
    const query = inputValue.toLowerCase();

    const foundOptions = query
      ? parsedOptions.filter(
          (option) =>
            option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
        )
      : parsedOptions;

    if (!isMultiSelect) return foundOptions;

    const unselectedOptions = foundOptions.filter(
      (option) => !selectedValues?.includes(option.value)
    );

    return unselectedOptions;
  }, [inputValue, isMultiSelect, parsedOptions, selectedValues]);

  const closeWithDelay = useCallback(() => {
    setTimeout(() => setIsOpen(false), 100);
  }, []);

  const emitChange = useCallback(
    (newValue: string) => {
      onValueChange?.(newValue);

      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue }
        } as unknown as ChangeEvent<HTMLSelectElement>;

        onChange(syntheticEvent);
      }
    },
    [onChange, onValueChange]
  );

  const handleSelect = useCallback(
    (option: SelectOption) => {
      setInputValue(!isMultiSelect ? option.label : '');
      emitChange(option.value);

      if (isMultiSelect && onSelectedValuesChange) {
        const isValueSelected = selectedValues?.includes(option.value);

        const filteredSelectedValues = isValueSelected
          ? selectedValues?.filter((value) => value !== option.value)
          : [...(selectedValues ?? []), option.value];

        onSelectedValuesChange(filteredSelectedValues ?? []);
      } else {
        setIsOpen(false);
      }
    },
    [emitChange, isMultiSelect, onSelectedValuesChange, selectedValues]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        setIsOpen(true);
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setHighlightedIndex((idx) => Math.min(idx + 1, filteredOptions.length - 1));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setHighlightedIndex((idx) => Math.max(idx - 1, 0));
          break;
        }
        case 'Enter': {
          if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            e.preventDefault();
            handleSelect(filteredOptions[highlightedIndex]!);
          }
          break;
        }
        case 'Escape': {
          setIsOpen(false);
          break;
        }
        default:
          break;
      }
    },
    [filteredOptions, handleSelect, highlightedIndex, isOpen]
  );

  useEffect(() => {
    if (!isMultiSelect) setInputValue(selectedOption?.label ?? '');
  }, [isMultiSelect, selectedOption?.label]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    } else if (filteredOptions.length > 0) {
      setHighlightedIndex(0);
    }
  }, [isOpen, filteredOptions.length]);

  return {
    refs: {
      containerRef,
      listRef
    },
    state: {
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      selectedValues,
      onSelectedValuesChange,
      highlightedIndex,
      setHighlightedIndex
    },
    data: {
      parsedOptions,
      filteredOptions,
      selectedOption,
      selectedValue
    },
    handlers: {
      onKeyDown,
      closeWithDelay,
      handleSelect
    }
  } as const;
};
