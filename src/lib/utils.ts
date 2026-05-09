/**
 * Format a date to a readable string
 */
export function formatDate(date: Date, locale: 'es' | 'en' = 'es'): string {
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'
  return date.toLocaleDateString(localeCode, { year: "numeric", month: "long" })
}

/**
 * Class name utility with tailwind-merge (shadcn/ui version)
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
