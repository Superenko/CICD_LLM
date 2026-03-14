import {
  useRef,
  useState,
  useEffect,
  type FormEvent,
  type InputHTMLAttributes,
  type ChangeEvent
} from 'react';
import { useSearchParams } from 'react-router';

import Input from '@/components/ui/Input';
import { SEARCH_QUERY_PARAM } from '@/constants/misc';
import { cn } from '@/utils/misc';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onSearch?: (value: string) => void;
  containerClassName?: string;
}

const SearchInput = ({ id, label, onSearch, containerClassName, ...props }: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchValue = searchParams.get(SEARCH_QUERY_PARAM) || '';

  const [inputValue, setInputValue] = useState(urlSearchValue);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setInputValue(newValue);
    onSearch?.(newValue);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (newValue !== '') {
      debounceTimeout.current = setTimeout(() => {
        setSearchParams((prev) => ({ ...prev, [SEARCH_QUERY_PARAM]: newValue }));
      }, 500);
    } else {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(SEARCH_QUERY_PARAM);
      setSearchParams(newSearchParams);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchParams((prev) => ({ ...prev, [SEARCH_QUERY_PARAM]: inputValue }));
  };

  useEffect(() => {
    setInputValue(urlSearchValue);
  }, [urlSearchValue]);

  return (
    <form className={cn('w-full max-w-md', containerClassName)} onSubmit={handleSubmit}>
      <div className="flex gap-x-4">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>

        <Input
          id={id}
          name={SEARCH_QUERY_PARAM}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    </form>
  );
};

export default SearchInput;
