import { MODEL_PAGES_PROJECT_SUFFIX } from '@shared/constants';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProjectName = (value?: string) => `${value}-${MODEL_PAGES_PROJECT_SUFFIX}`;

export const alphabeticalSort = (a: string, b: string) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' });

export const numericSort = (a: number, b: number, direction: 'asc' | 'desc' = 'asc') =>
  direction === 'asc' ? a - b : b - a;

export const isDevMode = () => process.env.NODE_ENV === 'development';
