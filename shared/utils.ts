import { MODEL_PAGES_PROJECT_SUFFIX } from './constants';
import { type Nullable } from './types';

export const extractModelName = (value?: Nullable<string>): Nullable<string> => {
  if (!value) return null;
  const projectSuffixRegex = new RegExp(`-${MODEL_PAGES_PROJECT_SUFFIX}$`);
  return value.replace(projectSuffixRegex, '');
};
