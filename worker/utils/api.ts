import { CloudflareError } from 'cloudflare';

import { CloudflareErrorParams } from '../types/cloudflare';

export const handleApiError = (error: unknown, defaultMessage = 'An unexpected error occurred') => {
  let errorMessage = defaultMessage;

  if (error instanceof Error) {
    errorMessage = error.message || defaultMessage;
  } else if (typeof error === 'string' && error.length > 0) {
    errorMessage = error;
  }

  return { error: errorMessage };
};

export const handleServiceError = (
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): void => {
  if (error instanceof CloudflareError && 'errors' in error) {
    const errors = error.errors as CloudflareErrorParams[];
    throw new Error(errors?.[0]?.message ?? defaultMessage);
  }

  if (error instanceof Error) throw error;

  throw new Error(defaultMessage);
};
