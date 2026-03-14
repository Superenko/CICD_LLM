import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { GithubWorkflowJobStepStatus } from '@/types/github';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const checkIfDeploying = (status: GithubWorkflowJobStepStatus) => {
  const progressStatuses: GithubWorkflowJobStepStatus[] = [
    'queued',
    'in_progress',
    'waiting',
    'pending'
  ];

  return progressStatuses.includes(status);
};

export const getStringColors = (value: string) => {
  let hash = 0;
  let hexColor = '#';

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const rgb = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    const hexValue = (hash >> (i * 8)) & 0xff; // Extract 8 bits and convert to hex
    rgb[i] = hexValue;
    hexColor += ('00' + hexValue.toString(16)).slice(-2);
  }

  // Calculate luminance to determine if color is light or dark
  // Formula: https://www.w3.org/TR/AERT/#color-contrast
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const textColor = luminance > 0.6 ? '#000000' : '#FFFFFF';

  return {
    bgColor: hexColor,
    textColor
  };
};

export const getCookie = (name: string) => {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    const cookieLength = cookie.length;

    while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookieLength);

    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookieLength);
    }
  }

  return null;
};
