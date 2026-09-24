import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** "First Last" for display, skipping whichever part is empty. */
export const fullName = (p: { firstName?: string; lastName?: string }) => [p.firstName, p.lastName].filter(Boolean).join(' ');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
