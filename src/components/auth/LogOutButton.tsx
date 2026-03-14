import type { ButtonHTMLAttributes, FormEvent } from 'react';

import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/misc';

interface LogOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  containerClassName?: string;
}

const LogOutButton = ({ containerClassName, className, ...props }: LogOutButtonProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <form onSubmit={handleLogout} className={containerClassName}>
      <button
        className={cn(
          'block w-full cursor-pointer px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
          className
        )}
        type="submit"
        {...props}
      >
        Log Out
      </button>
    </form>
  );
};

export default LogOutButton;
