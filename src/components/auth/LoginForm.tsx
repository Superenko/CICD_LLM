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
    <form onSubmit={handleSubmit} {...props}>
      {error && (
        <div className="mb-3 text-red-600">
          <div className="font-medium">Whoops! Something went wrong.</div>
          <p className="mt-1.5 text-sm">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          className="mt-1 block w-full"
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

      <div className="mt-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          className="mt-1 block w-full"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
          disabled={isLoading}
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
        <button
          type="button"
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          disabled={isLoading}
        >
          {isRegisterMode ? 'Already have an account? Log in' : "Don't have an account? Register"}
        </button>
        <Button
          type="submit"
          disabled={isLoading}
          icon={isLoading ? <Loading className="size-5 text-white" /> : null}
        >
          {isRegisterMode ? 'Register' : 'Log In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
