import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date as a string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get the first day of the current month
 */
export function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the last day of the current month
 */
export function getLastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Get the first day of the previous month
 */
export function getFirstDayOfPreviousMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

/**
 * Get the last day of the previous month
 */
export function getLastDayOfPreviousMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0);
}

/**
 * Get the first day of the current week (Sunday)
 */
export function getFirstDayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - day;
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

/**
 * Get the last day of the current week (Saturday)
 */
export function getLastDayOfCurrentWeek(): Date {
  const firstDay = getFirstDayOfCurrentWeek();
  const lastDay = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);
  return lastDay;
}

/**
 * Get the first day of the current year
 */
export function getFirstDayOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

/**
 * Get the last day of the current year
 */
export function getLastDayOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31);
}
