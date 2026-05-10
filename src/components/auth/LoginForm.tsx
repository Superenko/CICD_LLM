import { useState, type FormEvent, type FormHTMLAttributes } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../../hooks/useAuth';
import Loading from '../icons/Loading';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

const LoginForm = (props: FormHTMLAttributes<HTMLFormElement>) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let isSuccessful = false;
    if (isRegisterMode) {
      isSuccessful = await register({ email, password });
    } else {
      isSuccessful = await login({ email, password });
    }

    if (isSuccessful) {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props} className="flex flex-col">
      <div className="mb-6 flex w-full rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setIsRegisterMode(false)}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all duration-200 ease-in-out ${
            !isRegisterMode
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          disabled={isLoading}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => setIsRegisterMode(true)}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all duration-200 ease-in-out ${
            isRegisterMode
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          disabled={isLoading}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm font-medium text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            className="mt-1 block w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            className="mt-1 block w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            disabled={isLoading}
          />
          {isRegisterMode && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters long and contain at least one letter and one number.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isLoading}
          icon={isLoading ? <Loading className="size-5 text-white" /> : null}
        >
          {isRegisterMode ? 'Create Account' : 'Log In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
